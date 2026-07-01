/**
 * 年命类型定义
 *
 * 年命 = 出生年的天干地支，是大六壬判断层的必要输入。
 * 用于行年计算、空亡判断、一式多断等。
 */

import type { TianGan, DiZhi } from './index';

/** 年命：出生年的天干地支 */
export interface NianMing {
  gan: TianGan;
  zhi: DiZhi;
}

/** 年命计算后的扩展信息 */
export interface NianMingContext {
  yearGanZhi: string;   // "甲子"
  age: number;          // 起课时虚岁
  xingNian: string;     // 行年干支
}

/** 天干选项 */
export const GAN_OPTIONS: TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支选项 */
export const ZHI_OPTIONS: DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
