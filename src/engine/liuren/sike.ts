/**
 * 四课生成
 *
 * 输入：日干、日支、天地盘
 * 规则：
 *   1. 日干寄宫：使用 GAN_JI_GONG 查表
 *   2. 第一课：日干寄宫上神（地盘寄宫位置的天盘地支）
 *   3. 第二课：第一课上神的上神（以第一课的上神为地盘位，查其上的天盘）
 *   4. 第三课：日支上神
 *   5. 第四课：第三课上神的上神
 *   6. 每组上下神之间标注五行生克关系（上克下/下贼上/比和）
 */

import type { Branch, Gan, SiKeItem, KeRelation, TianDiPan, WuXing } from './types.js';
import { GAN_JI_GONG, BRANCH_WUXING } from './types.js';
import { getTianPanZhi } from './tiandi-pan.js';
import { KE_MATRIX } from './constants.js';

/**
 * 判断上下神之间的生克关系
 *
 * @param upper 上神（天盘）
 * @param lower 下神（地盘）
 * @returns 生克关系
 */
export function getKeRelation(upper: Branch, lower: Branch): KeRelation {
  const upperWuXing: WuXing = BRANCH_WUXING[upper];
  const lowerWuXing: WuXing = BRANCH_WUXING[lower];

  if (upper === lower) return '比和';

  // 上克下：上神五行克下神五行
  if (KE_MATRIX[upperWuXing][lowerWuXing]) return '上克下';

  // 下贼上：下神五行克上神五行
  if (KE_MATRIX[lowerWuXing][upperWuXing]) return '下贼上';

  return '比和';
}

/**
 * 生成四课
 *
 * @param dayGan 日干
 * @param dayZhi 日支
 * @param tianDiPan 天地盘
 * @returns 四课 [一课, 二课, 三课, 四课]
 */
export function buildSiKe(
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): [SiKeItem, SiKeItem, SiKeItem, SiKeItem] {
  // 日干寄宫
  const jiGong: Branch = GAN_JI_GONG[dayGan];

  // 第一课：日干寄宫位置的天盘地支（即上神）
  const firstUpper: Branch = getTianPanZhi(jiGong, tianDiPan);
  const firstRelation: KeRelation = getKeRelation(firstUpper, jiGong);
  const first: SiKeItem = {
    upperGod: firstUpper,
    lowerGod: jiGong,
    relation: firstRelation,
  };

  // 第二课：第一课上神的上神
  const secondUpper: Branch = getTianPanZhi(firstUpper, tianDiPan);
  const secondRelation: KeRelation = getKeRelation(secondUpper, firstUpper);
  const second: SiKeItem = {
    upperGod: secondUpper,
    lowerGod: firstUpper,
    relation: secondRelation,
  };

  // 第三课：日支上神
  const thirdUpper: Branch = getTianPanZhi(dayZhi, tianDiPan);
  const thirdRelation: KeRelation = getKeRelation(thirdUpper, dayZhi);
  const third: SiKeItem = {
    upperGod: thirdUpper,
    lowerGod: dayZhi,
    relation: thirdRelation,
  };

  // 第四课：第三课上神的上神
  const fourthUpper: Branch = getTianPanZhi(thirdUpper, tianDiPan);
  const fourthRelation: KeRelation = getKeRelation(fourthUpper, thirdUpper);
  const fourth: SiKeItem = {
    upperGod: fourthUpper,
    lowerGod: thirdUpper,
    relation: fourthRelation,
  };

  return [first, second, third, fourth];
}

/**
 * 统计四课中各类关系的数量
 */
export function analyzeSiKe(siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem]): {
  keShangCount: number;   // 上克下数量
  xiaZeCount: number;     // 下贼上数量
  biHeCount: number;      // 比和数量
  hasKe: boolean;         // 是否有克
  allBiHe: boolean;       // 是否全部比和
  kePositions: number[];  // 克关系位置（0-3）
} {
  let keShangCount = 0;
  let xiaZeCount = 0;
  let biHeCount = 0;
  const kePositions: number[] = [];

  siKe.forEach((item, idx) => {
    if (item.relation === '上克下') {
      keShangCount++;
      kePositions.push(idx);
    } else if (item.relation === '下贼上') {
      xiaZeCount++;
      kePositions.push(idx);
    } else {
      biHeCount++;
    }
  });

  return {
    keShangCount,
    xiaZeCount,
    biHeCount,
    hasKe: keShangCount > 0 || xiaZeCount > 0,
    allBiHe: biHeCount === 4,
    kePositions,
  };
}
