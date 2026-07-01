/**
 * 毕法赋匹配模块
 *
 * 实现毕法赋法则的结构化匹配，
 * 扫描所有规则，返回匹配的法则列表。
 */

import type { LiurenPan } from './types.js';
import { BI_FA_RULES } from './bifaRules.js';

/** 占事类型 */
export type ZhanShi =
  | '官职'
  | '婚姻'
  | '疾病'
  | '求财'
  | '出行'
  | '诉讼'
  | '学业'
  | '天时'
  | '其他';

/** 毕法赋大类 */
export type BiFaCategory =
  | '官禄功名'
  | '婚姻胎产'
  | '疾病死亡'
  | '求财交易'
  | '出行行人'
  | '诉讼冤狱'
  | '三传变化'
  | '墓神凶象'
  | '空亡进退'
  | '其他';

/** 毕法赋规则 */
export interface BiFaRule {
  id: number;
  title: string;
  description: string;
  category: BiFaCategory;
  condition: (pan: LiurenPan) => boolean;
  judgment: {
    trend: '吉' | '凶' | '中性';
    scene: Partial<Record<ZhanShi, string>>;
  };
}

/** 毕法赋匹配结果 */
export interface BiFaMatch {
  rule: BiFaRule;
  sceneJudgment?: string;
  relevance: number;
}

/**
 * 毕法赋匹配引擎
 *
 * 扫描所有规则，返回匹配的法则列表
 */
export function matchBiFa(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): BiFaMatch[] {
  const matches: BiFaMatch[] = [];

  for (const rule of BI_FA_RULES) {
    try {
      if (rule.condition(pan)) {
        matches.push({
          rule,
          sceneJudgment: zhanShi ? rule.judgment.scene[zhanShi] : undefined,
          relevance: 0.8,
        });
      }
    } catch (err) {
      console.warn(`BiFa 规则 "${rule.title}" 执行出错:`, err);
    }
  }

  return matches;
}
