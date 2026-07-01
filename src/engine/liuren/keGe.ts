/**
 * 课格分类模块
 *
 * 将九宗门课体扩展为64课名分类，
 * 每个课格提供象意和吉凶倾向。
 *
 * 优先级：特殊课格 > 九宗门基础课格
 */

import type { Branch, GeJu, LiurenPan } from './types.js';
import { BRANCH_INDEX, BRANCH_YINYANG } from './types.js';
import { KE_GE_DB } from './keGeDb.js';
import type { KeGe } from './keGeDb.js';
import type { KeGeCategory } from './framework-types.js';

export type { KeGeCategory };

/** 课格分析结果 */
export interface KeGeAnalysis {
  keGe: KeGe;
  alternativeKeGe?: KeGe;
  confidence: number;
  reasoning: string;
}

/**
 * 课格分类函数
 *
 * 优先级：特殊课格 > 九宗门基础课格
 * 检查顺序：先查特殊课格（铸印、斩关等），再查基础课格
 */
export function classifyKeGe(pan: LiurenPan): KeGeAnalysis {
  // 1. 先检查特殊课格（优先级最高）
  const specialKeGe = checkSpecialKeGe(pan);
  if (specialKeGe) {
    return {
      keGe: specialKeGe,
      confidence: 0.9,
      reasoning: `满足特殊课格「${specialKeGe.name}」的条件`,
    };
  }

  // 2. 基于九宗门课体确定基础课格
  const baseKeGe = getBaseKeGe(pan.geJu);
  if (baseKeGe) {
    return {
      keGe: baseKeGe,
      confidence: 0.8,
      reasoning: `九宗门课体为「${pan.geJu}」，对应课格「${baseKeGe.name}」`,
    };
  }

  // 3. 兜底
  const fallback: KeGe = {
    name: '其他',
    category: '特殊',
    meaning: '未归类课格',
    trend: '中性',
    applicableScenes: [],
    inapplicableScenes: [],
  };
  return {
    keGe: fallback,
    confidence: 0.3,
    reasoning: '未匹配到已知课格',
  };
}

/**
 * 检查特殊课格
 *
 * 按优先级逐个检查，返回第一个匹配的特殊课格
 */
function checkSpecialKeGe(pan: LiurenPan): KeGe | null {
  // 铸印课：巳戌卯三合成印局
  const branches = pan.sanChuan.map(item => item.branch);
  if (branches.includes('巳') && branches.includes('戌') && branches.includes('卯')) {
    return KE_GE_DB.find(g => g.name === '铸印') ?? null;
  }

  // 伏吟课：天地盘重叠不动
  if (pan.tianDiPan.tianPan.every((b, i) => b === pan.tianDiPan.diPan[i])) {
    return KE_GE_DB.find(g => g.name === '伏吟') ?? null;
  }

  // 返吟课：天地盘完全对冲
  const isFanYin = pan.tianDiPan.tianPan.every((b, i) => {
    const diZhi = pan.tianDiPan.diPan[i];
    const cha = Math.abs(BRANCH_INDEX[b] - BRANCH_INDEX[diZhi]);
    return cha === 6;
  });
  if (isFanYin) {
    return KE_GE_DB.find(g => g.name === '返吟') ?? null;
  }

  // 极阴课：四课三传皆阴
  const allYin = pan.siKe.every(ke =>
    BRANCH_YINYANG[ke.upperGod] === '阴' && BRANCH_YINYANG[ke.lowerGod] === '阴',
  ) && pan.sanChuan.every(item => BRANCH_YINYANG[item.branch] === '阴');
  if (allYin) {
    return KE_GE_DB.find(g => g.name === '极阴') ?? null;
  }

  // 连茹课：三传地支相连（支持正序、逆序、循环）
  const indices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
  const circDist = (a: number, b: number) => Math.abs(a - b) === 1 || Math.abs(a - b) === 11;
  if (circDist(indices[0], indices[1]) && circDist(indices[1], indices[2])) {
    return KE_GE_DB.find(g => g.name === '连茹') ?? null;
  }

  // 三奇课：亥子丑/申酉戌/寅卯辰三奇汇聚
  const branchSet = new Set(branches);
  const triplePatterns: Branch[][] = [
    ['亥', '子', '丑'],
    ['申', '酉', '戌'],
    ['寅', '卯', '辰'],
  ];
  for (const pattern of triplePatterns) {
    if (pattern.every(b => branchSet.has(b))) {
      return KE_GE_DB.find(g => g.name === '三奇') ?? null;
    }
  }

  return null;
}

/**
 * 基于九宗门课体获取基础课格
 */
function getBaseKeGe(geJu: GeJu): KeGe | null {
  const nameMap: Record<GeJu, string> = {
    '元首': '元首',
    '重审': '重审',
    '知一': '知一',
    '涉害': '涉害',
    '遥克': '遥克',
    '昴星': '昴星',
    '别责': '别责',
    '八专': '八专',
    '伏吟': '伏吟',
    '返吟': '返吟',
  };
  const name = nameMap[geJu];
  return KE_GE_DB.find(g => g.name === name) ?? null;
}
