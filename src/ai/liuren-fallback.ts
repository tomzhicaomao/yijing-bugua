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
 *
 * 综合考虑格局、天将、六亲、神煞
 */
function inferTrend(pan: LiurenPan): InterpretationResult['trend'] {
  let score = 0;

  // 1. 格局吉凶
  const jiGeJu = ['元首', '重审'];
  const xiongGeJu = ['伏吟', '返吟'];
  if (jiGeJu.includes(pan.geJu)) score += 2;
  if (xiongGeJu.includes(pan.geJu)) score -= 2;

  // 2. 三传天将吉凶
  const jiGenerals = ['贵人', '青龙', '六合', '太常', '太阴', '天后'];
  const xiongGenerals = ['白虎', '螣蛇', '朱雀', '勾陈', '玄武', '天空'];
  pan.sanChuan.forEach(item => {
    if (jiGenerals.includes(item.tianJiang)) score += 1;
    if (xiongGenerals.includes(item.tianJiang)) score -= 1;
  });

  // 3. 神煞
  const jiCount = pan.shenSha.filter(s => s.category === '吉').length;
  const xiongCount = pan.shenSha.filter(s => s.category === '凶').length;
  score += Math.min(jiCount - xiongCount, 3); // 最多 ±3

  // 4. 综合判断
  if (score >= 2) return '利';
  if (score <= -2) return '不利';
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
 *
 * 应期推算规则：
 * 1. 伏吟：事主迟缓，应期在冲日（如子伏吟应午日）
 * 2. 返吟：事主反复，应期在合日
 * 3. 三传旺相：应在本日或当日
 * 4. 三传休囚：应在生旺之日
 * 5. 初传空亡：应在填实之日
 * 6. 三传中见驿马：应在冲动之日
 */
function inferTimeWindow(pan: LiurenPan): string {
  const parts: string[] = [];

  // 格局应期
  if (pan.geJu === '伏吟') {
    parts.push('事主迟缓，应期较远，宜待冲日');
  } else if (pan.geJu === '返吟') {
    parts.push('事主反复，应期不定，宜待合日');
  }

  // 三传应期
  const chuanNames = ['初传', '中传', '末传'];
  pan.sanChuan.forEach((item, idx) => {
    // 空亡应期
    if (pan.warnings.some(w => w.includes('空亡') && w.includes(item.branch))) {
      parts.push(`${chuanNames[idx]}落空亡，应在填实之日`);
    }
  });

  // 驿马应期
  const yiMa = pan.shenSha.find(s => s.name === '驿马');
  if (yiMa) {
    parts.push(`驿马在${yiMa.branch}，应在冲${yiMa.branch}之日`);
  }

  // 日马应期
  const riMa = pan.shenSha.find(s => s.name === '日马');
  if (riMa) {
    parts.push(`日马在${riMa.branch}，动象应在${riMa.branch}日`);
  }

  if (parts.length === 0) {
    parts.push('具体应期需结合课式细节判断');
  }

  return parts.join('；');
}

/**
 * 构建回答
 */
function buildAnswer(pan: LiurenPan, _question: string): string {
  const trend = inferTrend(pan);
  const prefix = trend === '利' ? '此课偏吉' : trend === '不利' ? '此课偏凶' : '此课吉凶参半';

  return `${prefix}，格局为「${pan.geJu}」。以下为离线基础解读，仅供参考，建议联网获取 AI 深度分析。`;
}
