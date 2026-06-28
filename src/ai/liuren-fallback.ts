/**
 * 大六壬离线 Fallback 解读
 *
 * 当 AI 不可用时，提供基于规则的基础解读
 */

import type { LiurenPan } from '../engine/liuren/types.js';
import type { InterpretationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * 生成离线 Fallback 解读
 *
 * @param pan 完整课式
 * @param question 用户问题
 * @returns 基础解读结果
 */
export function generateLiurenFallback(
  pan: LiurenPan,
  question: string,
): InterpretationResult {
  const trend = inferTrend(pan);
  const analysis = buildAnalysis(pan);
  const conditions = buildConditions(pan);
  const timeWindow = inferTimeWindow(pan);
  const answer = buildAnswer(pan, question);

  return {
    id: uuidv4(),
    type: 'default',
    trend,
    analysis,
    conditions,
    timeWindow,
    answer,
    confidence: '低',
    model: 'fallback-offline',
    promptVersion: 'fallback-1.0',
    claims: [
      {
        id: uuidv4(),
        type: 'trend',
        text: `${trend === '利' ? '此课偏吉' : trend === '不利' ? '此课偏凶' : '此课吉凶参半'}`,
      },
      {
        id: uuidv4(),
        type: 'advice',
        text: '以下为离线基础解读，仅供参考。建议联网获取 AI 深度解读。',
      },
    ],
  };
}

/**
 * 推断趋势
 */
function inferTrend(pan: LiurenPan): InterpretationResult['trend'] {
  // 吉格局
  const jiGeJu = ['元首', '重审'];
  if (jiGeJu.includes(pan.geJu)) return '利';

  // 凶格局
  const xiongGeJu = ['伏吟', '返吟'];
  if (xiongGeJu.includes(pan.geJu)) return '不利';

  // 三传中吉凶神数量
  const jiCount = pan.shenSha.filter(s => s.category === '吉').length;
  const xiongCount = pan.shenSha.filter(s => s.category === '凶').length;

  if (jiCount > xiongCount + 2) return '利';
  if (xiongCount > jiCount + 2) return '不利';

  return '中性';
}

/**
 * 构建分析文本
 */
function buildAnalysis(pan: LiurenPan): string {
  const parts: string[] = [];

  parts.push(`【格局】${pan.geJu}`);
  parts.push(`【日干支】${pan.dayGanZhi}，${pan.isDaytime ? '昼' : '夜'}占`);
  parts.push(`【月将】${pan.yueJiang}，【占时】${pan.shiZhi}`);
  parts.push('');

  parts.push('【四课】');
  const sikeNames = ['一课', '二课', '三课', '四课'];
  pan.siKe.forEach((item, idx) => {
    const symbol = item.relation === '上克下' ? '↓' : item.relation === '下贼上' ? '↑' : '=';
    parts.push(`  ${sikeNames[idx]}：${item.upperGod} ${symbol} ${item.lowerGod}（${item.relation}）`);
  });
  parts.push('');

  parts.push('【三传】');
  const chuanNames = ['初传', '中传', '末传'];
  pan.sanChuan.forEach((item, idx) => {
    parts.push(`  ${chuanNames[idx]}：${item.branch} | ${item.tianJiang} | ${item.liuQin} | 遁${item.dunGan}`);
  });
  parts.push('');

  if (pan.warnings.length > 0) {
    parts.push('【⚠️ 系统警告】');
    pan.warnings.forEach(w => parts.push(`  - ${w}`));
  }

  return parts.join('\n');
}

/**
 * 构建条件
 */
function buildConditions(pan: LiurenPan): string[] {
  const conditions: string[] = [];

  // 空亡条件
  if (pan.warnings.some(w => w.includes('空亡'))) {
    conditions.push('课中见空亡，事宜缓图');
  }

  // 神煞矛盾
  if (pan.warnings.some(w => w.includes('矛盾'))) {
    conditions.push('吉凶神煞并见，事态复杂');
  }

  // 太岁
  if (pan.warnings.some(w => w.includes('太岁'))) {
    conditions.push('见太岁，主年内之事');
  }

  return conditions;
}

/**
 * 推断应期
 */
function inferTimeWindow(pan: LiurenPan): string {
  // 简化版应期推断
  if (pan.geJu === '伏吟') return '事主迟缓，应期较远';
  if (pan.geJu === '返吟') return '事主反复，应期不定';
  return '具体应期需结合课式细节判断';
}

/**
 * 构建回答
 */
function buildAnswer(pan: LiurenPan, _question: string): string {
  const trend = inferTrend(pan);
  const prefix = trend === '利' ? '此课偏吉' : trend === '不利' ? '此课偏凶' : '此课吉凶参半';

  return `${prefix}，格局为「${pan.geJu}」。以下为离线基础解读，仅供参考，建议联网获取 AI 深度分析。`;
}
