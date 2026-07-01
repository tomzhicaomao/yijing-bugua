/**
 * 年命计算模块
 *
 * 功能:
 * 1. 根据出生年干支 + 当前日期计算虚岁
 * 2. 计算行年干支（用于空亡判断、一式多断）
 *
 * 行年算法:
 * - 男命: 从丙寅起，顺行至当前年
 * - 女命: 从壬申起，逆行至当前年
 * - 本实现暂不区分性别（简化），后续可扩展
 */

import type { NianMing, NianMingContext } from '../../types/nian-ming';
import type { Gan, Branch } from './types.js';

const GAN_LIST: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_LIST: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 60 甲子序（索引 0 = 甲子） */
function ganZhiIndex(gan: string, zhi: string): number {
  const gi = GAN_LIST.indexOf(gan as Gan);
  const zi = ZHI_LIST.indexOf(zhi as Branch);
  if (gi < 0 || zi < 0) return 0;
  // 60 甲子: 天干索引 = index % 10, 地支索引 = index % 12
  // 反推: 找到 index 使得 index%10==gi 且 index%12==zi
  for (let i = 0; i < 60; i++) {
    if (i % 10 === gi && i % 12 === zi) return i;
  }
  return 0;
}

/** 根据 60 甲子索引取干支 */
function ganZhiByIndex(index: number): string {
  const gi = ((index % 60) % 10 + 10) % 10;
  const zi = ((index % 60) % 12 + 12) % 12;
  return `${GAN_LIST[gi]}${ZHI_LIST[zi]}`;
}

/**
 * 计算年命上下文
 *
 * @param nianMing 出生年干支
 * @param currentDate 当前日期（通常为起课时间）
 * @returns 年命扩展信息（干支、虚岁、行年）
 */
export function calculateNianMingContext(
  nianMing: NianMing,
  currentDate: Date,
): NianMingContext {
  const yearGanZhi = `${nianMing.gan}${nianMing.zhi}`;

  // 当前年的干支
  const currentYear = currentDate.getFullYear();

  // 干支年份计算：以 2024 甲辰年为锚点
  const ANCHOR_YEAR = 2024;
  const ANCHOR_ZHI = 4; // 辰=4 (2024 地支 = 辰)

  const currentZhi = ((currentYear - ANCHOR_YEAR + ANCHOR_ZHI) % 12 + 12) % 12;

  // 出生年索引（60甲子）
  const birthGZIndex = ganZhiIndex(nianMing.gan, nianMing.zhi);

  // 虚岁：当前年地支 - 出生年地支 + 1（简化算法）
  const age = ((currentZhi - (birthGZIndex % 12)) % 12 + 12) % 12 + 1;

  // 行年：简化为 60 甲子中从出生年顺推 age-1 步
  const xingNianGZ = ganZhiByIndex(birthGZIndex + age - 1);

  return {
    yearGanZhi,
    age,
    xingNian: xingNianGZ,
  };
}
