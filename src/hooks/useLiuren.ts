/**
 * 大六壬 React Hook
 *
 * 管理起课、AI 解读、保存记录的完整流程
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { LiurenPan, Branch } from '../engine/liuren/types.js';
import { calculateLiuren } from '../engine/liuren/index.js';
import { serializePan } from '../engine/liuren/serialize.js';
import { callLiurenInterpretationV2 } from '../ai/liuren-call.js';
import { generateLiurenFallback } from '../ai/liuren-fallback.js';
import { createRecord, getAllRecords } from '../db/records.js';
import { checkDuplicate } from '../engine/duplicate-check.js';
import { useAuth } from '../auth/AuthContext';
import { validateQuestion, validateDateRange, checkRateLimit } from '../lib/security.js';
import { getNianMing, NIAN_MING_CHANGED_EVENT } from '../lib/nian-ming-storage.js';
import { calculateNianMingContext } from '../engine/liuren/nian-ming.js';
import type { NianMing, NianMingContext } from '../types/nian-ming.js';
import type { ZhanShi } from '../engine/liuren/bifa.js';
import type { DivinationRecord, InterpretationResult } from '../types';

/** 起课步骤 */
type LiurenStep = 'question' | 'casting' | 'result';

/** 保存状态 */
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Hook 状态 */
export interface UseLiurenState {
  step: LiurenStep;
  question: string;
  zhanShi: ZhanShi;
  customShiZhi: Branch | null;
  pan: LiurenPan | null;
  interpretation: InterpretationResult | null;
  aiProgress: 'idle' | 'reasoning' | 'narrative' | 'done' | 'error';
  error: string | null;
  duplicateWarning: string | null;
  savedRecordId: string | null;
  saveStatus: SaveStatus;
  nianMing: NianMing | null;
}

/**
 * 大六壬 Hook
 */
export function useLiuren() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<LiurenStep>('question');
  const [question, setQuestion] = useState('');
  const [zhanShi, setZhanShi] = useState<ZhanShi>('其他');
  const [customShiZhi, setCustomShiZhi] = useState<Branch | null>(null);
  const [pan, setPan] = useState<LiurenPan | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [aiProgress, setAiProgress] = useState<'idle' | 'reasoning' | 'narrative' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [nianMing, setNianMingState] = useState<NianMing | null>(getNianMing());

  const aiCancelled = useRef(false);
  const lastCallTime = useRef(0);

  // 监听设置页年命变化
  useEffect(() => {
    const handler = () => setNianMingState(getNianMing());
    window.addEventListener(NIAN_MING_CHANGED_EVENT, handler);
    return () => window.removeEventListener(NIAN_MING_CHANGED_EVENT, handler);
  }, []);

  /**
   * 构建 DivinationRecord（不执行写入）
   */
  const buildRecord = useCallback((
    panData: LiurenPan,
    q: string,
    interp: InterpretationResult | null,
    effectiveNianMing?: NianMing,
    nianMingCtx?: NianMingContext,
  ): DivinationRecord => ({
    schemaVersion: 1,
    id: uuidv4(),
    timestamp: panData.dateTime,
    question: q,
    category: '其他',
    method: customShiZhi ? 'liuren-huoshi' : 'liuren-zhengshi',
    hexagram: {
      original: 0,
      changed: null,
      changingLines: [],
    },
    interpretations: interp ? [interp] : [],
    feedback: {
      dueAt: null,
      status: 'pending',
    },
    liurenPan: serializePan(panData),
    duplicate: duplicateWarning ? { countInWindow: 1, relatedRecordIds: [] } : undefined,
    nianMing: effectiveNianMing ? {
      yearGanZhi: `${effectiveNianMing.gan}${effectiveNianMing.zhi}`,
      age: nianMingCtx?.age,
      xingNian: nianMingCtx?.xingNian,
    } : undefined,
  }), [customShiZhi, duplicateWarning]);

  /**
   * 自动保存并跳转（await 模式，不再 fire-and-forget）
   *
   * 返回 true = 保存成功并已导航，false = 保存失败
   */
  const autoSaveAndNavigate = useCallback(async (
    panData: LiurenPan,
    q: string,
    interp: InterpretationResult | null,
    effectiveNianMing?: NianMing,
    nianMingCtx?: NianMingContext,
  ): Promise<boolean> => {
    if (!user) {
      setError('请先登录');
      setSaveStatus('error');
      return false;
    }

    setSaveStatus('saving');
    const record = buildRecord(panData, q, interp, effectiveNianMing, nianMingCtx);

    try {
      await createRecord(record, user.id);
      setSavedRecordId(record.id);
      setSaveStatus('saved');
      navigate(`/liuren/${record.id}`);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存失败';
      console.error('[Liuren] autoSave failed:', err);
      setError(msg);
      setSaveStatus('error');
      return false;
    }
  }, [user, buildRecord, navigate]);

  /**
   * 重试保存（保存失败后用户手动触发）
   */
  const retrySave = useCallback(async () => {
    if (!pan) return;
    await autoSaveAndNavigate(pan, question, interpretation);
  }, [pan, question, interpretation, autoSaveAndNavigate]);

  /**
   * AI 解读
   */
  const startAIInterpretation = useCallback(async (
    panData: LiurenPan,
    q: string,
    zhanShiParam: ZhanShi,
    nianMingCtx?: NianMingContext,
  ) => {
    aiCancelled.current = false;
    setAiProgress('reasoning');

    let finalInterp: InterpretationResult | null;

    try {
      const result = await callLiurenInterpretationV2(panData, q, zhanShiParam, undefined, nianMingCtx);

      if (aiCancelled.current) return;

      if (result.success && result.interpretation) {
        finalInterp = result.interpretation;
        setInterpretation(result.interpretation);
        setAiProgress('done');
      } else {
        setAiProgress('error');
        const fallback = generateLiurenFallback(panData, q);
        finalInterp = fallback;
        setInterpretation(fallback);
        setAiProgress('done');
      }
    } catch {
      if (aiCancelled.current) return;
      setAiProgress('error');
      const fallback = generateLiurenFallback(panData, q);
      finalInterp = fallback;
      setInterpretation(fallback);
      setAiProgress('done');
    }

    // 先切到结果页显示课式和解读，再等待保存完成
    setStep('result');
    const effectiveNM = nianMing ?? undefined;
    await autoSaveAndNavigate(panData, q, finalInterp, effectiveNM, nianMingCtx);
  }, [autoSaveAndNavigate, nianMing]);

  /**
   * 设置问题并进入起课
   */
  const submitQuestion = useCallback(async (
    q: string,
    zhanShiParam: ZhanShi,
    shiZhi?: Branch,
    overrideNianMing?: NianMing,
  ) => {
    if (!user) {
      setError('请先登录');
      return;
    }

    // 年命校验
    const effectiveNianMing = overrideNianMing ?? nianMing;
    if (!effectiveNianMing) {
      setError('请先在设置页设置年命，或在起课前选择年命');
      return;
    }

    // 频率限制
    const rateCheck = checkRateLimit(lastCallTime.current, 2000);
    if (!rateCheck.allowed) {
      setError(`操作太频繁，请等待 ${Math.ceil((rateCheck.waitMs || 0) / 1000)} 秒`);
      return;
    }

    // 输入安全校验
    const questionCheck = validateQuestion(q);
    if (!questionCheck.valid) {
      setError(questionCheck.errors[0]);
      return;
    }

    // 日期范围校验
    const date = new Date();
    const dateCheck = validateDateRange(date);
    if (!dateCheck.valid) {
      setError(dateCheck.errors[0]);
      return;
    }

    const trimmed = q.trim();
    setQuestion(trimmed);
    setZhanShi(zhanShiParam);
    setCustomShiZhi(shiZhi || null);
    setError(null);
    setSaveStatus('idle');
    lastCallTime.current = Date.now();

    // 检查重复问题
    try {
      const allRecords = await getAllRecords(user.id);
      const dup = checkDuplicate(trimmed, allRecords, 24);
      if (dup) {
        setDuplicateWarning(`⚠️ 在过去 24 小时内已有 ${dup.countInWindow} 次相同问题`);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // 忽略重复检查错误
    }

    // 计算年命上下文
    const nianMingCtx = calculateNianMingContext(effectiveNianMing, new Date());

    // 起课
    try {
      const date = new Date();
      const result = calculateLiuren({
        date,
        shiZhi: shiZhi || undefined,
        question: trimmed,
        nianMing: effectiveNianMing,
      });
      setPan(result);
      setStep('casting');

      // 自动开始 AI 解读 + 保存（await 完整流程）
      await startAIInterpretation(result, trimmed, zhanShiParam, nianMingCtx);
    } catch (err) {
      setError(err instanceof Error ? err.message : '起课失败');
    }
  }, [user, nianMing, startAIInterpretation]);

  /**
   * 手动保存记录（备用，保留向后兼容）
   */
  const saveRecord = useCallback(async () => {
    if (!user || !pan) return;

    const record = buildRecord(pan, question, interpretation);

    try {
      await createRecord(record, user.id);
      setSavedRecordId(record.id);
      return record.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      return undefined;
    }
  }, [user, pan, question, interpretation, buildRecord]);

  /**
   * 重置
   */
  const reset = useCallback(() => {
    aiCancelled.current = true;
    setStep('question');
    setQuestion('');
    setZhanShi('其他');
    setCustomShiZhi(null);
    setPan(null);
    setInterpretation(null);
    setAiProgress('idle');
    setError(null);
    setDuplicateWarning(null);
    setSavedRecordId(null);
    setSaveStatus('idle');
  }, []);

  /**
   * 导航到结果页
   */
  const goToResult = useCallback((id: string) => {
    navigate(`/liuren/${id}`);
  }, [navigate]);

  return {
    // 状态
    step,
    question,
    zhanShi,
    customShiZhi,
    pan,
    interpretation,
    aiProgress,
    error,
    duplicateWarning,
    savedRecordId,
    saveStatus,
    nianMing,

    // 方法
    submitQuestion,
    saveRecord,
    reset,
    goToResult,
    retrySave,
  };
}
