/**
 * 大六壬起课页面
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiuren } from '../hooks/useLiuren';
import { FEATURE_LIUREN_ENABLED } from '../lib/constants';
import ShiZhiPicker from '../components/liuren/ShiZhiPicker';
import type { Category } from '../types';
import type { Branch as LiurenBranch } from '../engine/liuren/types';

const CATEGORIES: Category[] = ['工作', '人际', '财务', '健康', '其他'];

export default function LiurenView() {
  const navigate = useNavigate();
  const {
    step,
    pan,
    interpretation,
    aiProgress,
    error,
    duplicateWarning,
    saveStatus,
    submitQuestion,
    reset,
    retrySave,
  } = useLiuren();

  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<Category>('其他');
  const [shiZhi, setShiZhi] = useState<LiurenBranch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!FEATURE_LIUREN_ENABLED) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary flex items-center justify-center">
        <p className="font-mono text-sm text-nothing-text-disabled">功能未开启</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!question.trim() || submitting) return;
    setSubmitting(true);
    try {
      await submitQuestion(question.trim(), category, shiZhi || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  // 起课结果页
  if (step === 'result' && pan) {
    return (
      <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
        {/* Top bar */}
        <nav className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
          <button
            onClick={reset}
            className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary hover:text-nothing-text-primary"
          >
            ← 返回
          </button>
          <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">六壬</span>
          <div className="w-12" />
        </nav>

        <main className="px-6 max-w-md mx-auto pb-24">
          {/* 问题 */}
          <div className="mb-6">
            <p className="font-mono text-[11px] text-nothing-text-disabled tracking-wider mb-1">所问之事</p>
            <p className="text-sm text-nothing-text-primary">{question}</p>
          </div>

          {/* 格局 */}
          <div className="mb-4 p-4 border border-nothing-border rounded-md">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl text-nothing-text-display">{pan.geJu}</span>
              <span className="font-mono text-[10px] text-nothing-text-disabled">{pan.dayGanZhi}</span>
            </div>
            <div className="mt-2 font-mono text-[10px] text-nothing-text-disabled">
              {pan.solarTerm} · 月将{pan.yueJiang} · {pan.isDaytime ? '昼' : '夜'}占{pan.shiZhi}时
            </div>
          </div>

          {/* 四课 */}
          <div className="mb-4">
            <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">四课</div>
            <div className="grid grid-cols-2 gap-2">
              {pan.siKe.map((item, idx) => {
                const rel = item.relation === '上克下' ? '↓' : item.relation === '下贼上' ? '↑' : '=';
                const relColor = item.relation === '下贼上' ? 'text-red-400' : item.relation === '上克下' ? 'text-orange-400' : 'text-green-400';
                return (
                  <div key={idx} className="border border-nothing-border rounded p-3 text-center">
                    <div className="font-mono text-lg text-nothing-text-display">{item.upperGod}</div>
                    <div className={`font-mono text-sm ${relColor}`}>{rel}</div>
                    <div className="font-mono text-lg text-nothing-text-primary">{item.lowerGod}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 三传 */}
          <div className="mb-4">
            <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">三传</div>
            <div className="flex gap-2">
              {pan.sanChuan.map((item, idx) => (
                <div key={idx} className="flex-1 border border-nothing-border rounded p-3 text-center">
                  <div className="font-mono text-[10px] text-nothing-text-disabled mb-1">
                    {['初传', '中传', '末传'][idx]}
                  </div>
                  <div className="font-mono text-xl text-nothing-text-display">{item.branch}</div>
                  <div className="font-mono text-[10px] text-nothing-text-disabled mt-1">
                    {item.tianJiang} · {item.liuQin}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 神煞 */}
          {pan.shenSha.length > 0 && (
            <div className="mb-4">
              <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">神煞</div>
              <div className="flex flex-wrap gap-1.5">
                {pan.shenSha.slice(0, 20).map((s, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded border font-mono text-[10px] ${
                      s.category === '吉' ? 'border-green-500/30 text-green-400' :
                      s.category === '凶' ? 'border-red-500/30 text-red-400' :
                      'border-yellow-500/30 text-yellow-400'
                    }`}
                  >
                    {s.name}({s.branch})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 警告 */}
          {pan.warnings.length > 0 && (
            <div className="mb-4 border border-orange-500/30 rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 text-sm">⚠️</span>
                  <span className="font-mono text-xs tracking-[0.1em] text-orange-400">注意事项</span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-orange-300/70">以下提示不影响起课结果，解读时留意即可</p>
              </div>
              <div className="p-3 space-y-2">
                {pan.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 text-[10px] mt-1 shrink-0">▸</span>
                    <span className="font-mono text-[11px] text-orange-200 leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI 解读 */}
          <div className="mb-6">
            <div className="font-mono text-xs text-nothing-text-secondary tracking-[0.1em] mb-2">AI 解读</div>
            <div className="border border-nothing-border rounded-md p-4">
              {aiProgress === 'reasoning' || aiProgress === 'narrative' ? (
                <div className="space-y-2">
                  <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse" />
                  <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-nothing-bg-secondary rounded animate-pulse w-1/2" />
                </div>
              ) : interpretation ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                      interpretation.trend === '利' ? 'bg-green-500/10 text-green-400' :
                      interpretation.trend === '不利' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {interpretation.trend}
                    </span>
                    <span className="font-mono text-[10px] text-nothing-text-disabled">
                      置信度：{interpretation.confidence}
                    </span>
                  </div>
                  <div className="text-sm text-nothing-text-secondary leading-relaxed whitespace-pre-wrap">
                    {interpretation.analysis}
                  </div>
                  <div className="mt-3 text-sm text-nothing-text-primary">
                    {interpretation.answer}
                  </div>
                  {interpretation.model === 'fallback-offline' && (
                    <div className="mt-2 font-mono text-[10px] text-nothing-text-disabled">
                      ⚠️ 离线基础解读，仅供参考
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* 重复问题警告 */}
          {duplicateWarning && (
            <div className="mb-4 border border-yellow-500/30 rounded-md p-3">
              <span className="font-mono text-[11px] text-yellow-400">{duplicateWarning}</span>
            </div>
          )}

          {/* 保存状态 */}
          <div className="space-y-3">
            {saveStatus === 'saving' && (
              <div className="text-center py-2">
                <div className="inline-block w-4 h-4 border-2 border-nothing-text-display border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 font-mono text-[10px] text-nothing-text-disabled">正在保存记录…</p>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="border border-red-500/30 rounded-md p-4 text-center">
                <p className="font-mono text-[11px] text-red-400 mb-3">{error || '保存失败'}</p>
                <button
                  onClick={retrySave}
                  className="px-4 py-2 bg-nothing-text-display text-nothing-bg font-mono text-xs tracking-[0.1em] rounded-md hover:opacity-90 transition-opacity"
                >
                  重新保存
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // 问题输入页
  return (
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-16 max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary hover:text-nothing-text-primary"
        >
          ← 返回
        </button>
        <span className="font-mono text-xs tracking-[0.1em] text-nothing-text-secondary">六壬起课</span>
        <div className="w-12" />
      </nav>

      <main className="px-6 max-w-md mx-auto">
        {/* 标题 */}
        <div className="pt-8 pb-6">
          <h1 className="text-[24px] leading-[1.1] font-light tracking-[-0.02em] text-nothing-text-display">
            大六壬
          </h1>
          <div className="mt-4 space-y-1">
            <p className="text-[15px] text-nothing-text-secondary leading-relaxed">
              古代三式之一 · 占事决策
            </p>
            <p className="font-mono text-[11px] tracking-[0.08em] text-nothing-text-disabled">
              LIU REN · DIVINATION
            </p>
          </div>
        </div>

        {/* 问题输入 */}
        <div className="mb-6">
          <label className="block font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-2">
            所问之事（1-200字）
          </label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 border border-nothing-border rounded-md bg-nothing-bg text-nothing-text-primary font-mono text-sm resize-none focus:outline-none focus:border-nothing-text-disabled transition-colors"
            placeholder="请输入您想问的事..."
          />
          <div className="mt-1 text-right font-mono text-[10px] text-nothing-text-disabled">
            {question.length}/200
          </div>
        </div>

        {/* 分类选择 */}
        <div className="mb-6">
          <label className="block font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-2">
            问题分类
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded border font-mono text-xs transition-colors ${
                  category === cat
                    ? 'border-nothing-text-display text-nothing-text-display bg-nothing-bg-secondary'
                    : 'border-nothing-border text-nothing-text-disabled hover:text-nothing-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 时辰选择 */}
        <div className="mb-8">
          <label className="block font-mono text-[10px] text-nothing-text-disabled tracking-wider mb-2">
            占时（可选）
          </label>
          <ShiZhiPicker value={shiZhi} onChange={setShiZhi} />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 border border-red-500/30 rounded-md p-3">
            <span className="font-mono text-[11px] text-red-400">{error}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!question.trim() || submitting}
          className="w-full py-3 bg-nothing-text-display text-nothing-bg font-mono text-sm tracking-[0.1em] rounded-md hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-nothing-bg border-t-transparent rounded-full animate-spin" />
              <span>起课中…</span>
            </>
          ) : (
            '起课'
          )}
        </button>
      </main>

      {/* 起课中遮罩 */}
      {submitting && (
        <div className="fixed inset-0 z-[100] bg-nothing-bg/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nothing-text-display/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-nothing-text-display rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-transparent border-b-nothing-text-secondary rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <div className="text-center">
            <p className="font-mono text-sm text-nothing-text-display tracking-wider">起课中</p>
            <p className="font-mono text-[10px] text-nothing-text-disabled mt-1">推算天地盘 · 四课 · 三传</p>
          </div>
        </div>
      )}
    </div>
  );
}
