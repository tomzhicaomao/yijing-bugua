/**
 * 五子元遁推时干 + 三传天干 + 六亲断
 *
 * 五子元遁：根据日干推时干
 * 三传天干：根据三传地支找其所属旬的天干
 * 六亲：日干五行 vs 三传五行 → 六亲关系
 */

import type { Branch, Gan, WuXing, LiuQin, SanChuanResult, SanChuanItem, TianJiangInfo } from './types.js';
import {
  GAN_WUXING,
  BRANCH_WUXING,
  GAN_INDEX,
  ALL_GANS,
} from './types.js';

// ========== 五子元遁 ==========

/**
 * 五子元遁表
 * 日干 → 时干起始
 * 甲己日 → 甲子时起
 * 乙庚日 → 丙子时起
 * 丙辛日 → 戊子时起
 * 丁壬日 → 庚子时起
 * 戊癸日 → 壬子时起
 */
const WUZI_YUAN_DUN: Record<Gan, Gan> = {
  '甲': '甲', '己': '甲',
  '乙': '丙', '庚': '丙',
  '丙': '戊', '辛': '戊',
  '丁': '庚', '壬': '庚',
  '戊': '壬', '癸': '壬',
};

/**
 * 根据日干和时支推算时干
 *
 * @param dayGan 日干
 * @param shiZhi 时支
 * @returns 时干
 */
export function calcShiGan(dayGan: Gan, shiZhi: Branch): Gan {
  const startGan = WUZI_YUAN_DUN[dayGan];
  const startIdx = GAN_INDEX[startGan];
  const shiZhiIdx = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'].indexOf(shiZhi);
  return ALL_GANS[(startIdx + shiZhiIdx) % 10];
}

// ========== 三传天干 ==========

/**
 * 旬首天干映射
 * 根据地支查找该旬的天干
 * 例如：甲子旬 → 子=甲、丑=乙、寅=丙...亥=癸
 */

/** 六十甲子表 */
const JIAZI_60: string[] = [];
const jiaziGanOrder: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const jiaziZhiOrder: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
for (let i = 0; i < 60; i++) {
  JIAZI_60.push(jiaziGanOrder[i % 10] + jiaziZhiOrder[i % 12]);
}

/**
 * 根据日干支推算三传地支所配天干
 *
 * 简化版：根据日干支所在旬的起始，推算各支的天干
 *
 * @param dayGan 日干
 * @param dayZhi 日支
 * @param branch 目标地支
 * @returns 该地支所属天干
 */
export function calcDunGan(dayGan: Gan, dayZhi: Branch, branch: Branch): Gan {
  // 找到日干支在六十甲子中的位置
  const dayGanZhi = dayGan + dayZhi;
  const dayIdx = JIAZI_60.indexOf(dayGanZhi);

  // 找到该旬的甲日
  const xunStart = dayIdx - GAN_INDEX[dayGan];

  // 计算目标地支在该旬中的天干
  const branchIdx = jiaziZhiOrder.indexOf(branch);
  const ganIdx = (branchIdx - xunStart % 12 + 12) % 12;
  // 确保在旬内
  const dunGanIdx = (xunStart + (branchIdx - xunStart % 12 + 12) % 12) % 60;

  // 简化计算：直接用旬首
  // 旬首 = 日干 - (日支索引 - 子索引) 的修正
  // 实际上旬首天干 = 日干在天干中的位置 - 日支在该旬中的偏移
  const offset = (jiaziZhiOrder.indexOf(dayZhi) - jiaziZhiOrder.indexOf('子') + 12) % 12;
  const xunGan: Gan = ALL_GANS[(GAN_INDEX[dayGan] - offset + 10) % 10];

  // 从旬首天干开始，推算目标地支的天干
  const targetOffset = (jiaziZhiOrder.indexOf(branch) - jiaziZhiOrder.indexOf('子') + 12) % 12;
  return ALL_GANS[(GAN_INDEX[xunGan] + targetOffset) % 10];
}

// ========== 六亲 ==========

/**
 * 六亲关系表
 *
 * 生我者为父母
 * 我生者为子孙
 * 克我者为官鬼
 * 我克者为妻财
 * 同我者为兄弟
 */
const LIU_QIN_MAP: Record<string, LiuQin> = {
  'sheng': '父母',  // 生我
  'ke': '官鬼',      // 克我
  'wo_sheng': '子孙', // 我生
  'wo_ke': '妻财',    // 我克
  'bihe': '兄弟',    // 同我
};

/**
 * 计算六亲关系
 *
 * @param dayGanWuXing 日干五行
 * @param targetWuXing 目标五行
 * @returns 六亲关系
 */
export function calcLiuQin(dayGanWuXing: WuXing, targetWuXing: WuXing): LiuQin {
  if (dayGanWuXing === targetWuXing) return '兄弟';

  // 五行相生
  const shengCycle: Record<WuXing, WuXing> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  // 五行相克
  const keCycle: Record<WuXing, WuXing> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

  // 我生者为子孙
  if (shengCycle[dayGanWuXing] === targetWuXing) return '子孙';
  // 生我者为父母
  if (shengCycle[targetWuXing] === dayGanWuXing) return '父母';
  // 我克者为妻财
  if (keCycle[dayGanWuXing] === targetWuXing) return '妻财';
  // 克我者为官鬼
  if (keCycle[targetWuXing] === dayGanWuXing) return '官鬼';

  return '兄弟'; // fallback
}

/**
 * 构建完整三传项（含天将、遁干、六亲）
 */
export function buildSanChuanItems(
  sanChuanResult: SanChuanResult,
  dayGan: Gan,
  dayZhi: Branch,
  tianJiangInfo: TianJiangInfo,
): [SanChuanItem, SanChuanItem, SanChuanItem] {
  const dayGanWuXing = GAN_WUXING[dayGan];

  const branches = [sanChuanResult.chuChuan, sanChuanResult.zhongChuan, sanChuanResult.moChuan];

  return branches.map(branch => ({
    branch,
    tianJiang: tianJiangInfo.branchToJiang[branch],
    dunGan: calcDunGan(dayGan, dayZhi, branch),
    liuQin: calcLiuQin(dayGanWuXing, BRANCH_WUXING[branch]),
  })) as [SanChuanItem, SanChuanItem, SanChuanItem];
}
