/**
 * 十二天将排布
 *
 * 输入：日干、占时、天地盘
 * 规则：
 *   1. 昼夜判断：日占（卯时至申时 = 昼，酉时至寅时 = 夜）
 *   2. 贵人查表：GUI_REN_TABLE[日干][昼0/夜1] → 贵人地支
 *   3. 顺逆判断：贵人在地盘亥子丑寅卯辰 → 顺布（阳贵）
 *                贵人在地盘巳午未申酉戌 → 逆布（阴贵）
 *   4. 从贵人位开始，将十二将序列依次布在各天盘地支上
 */

import type { Branch, Gan, TianJiangName, TianJiangInfo, TianDiPan } from './types.js';
import {
  GUI_REN_TABLE,
  TIAN_JIANG_SHUN,
  TIAN_JIANG_NI,
  BRANCH_INDEX,
  ALL_BRANCHES,
} from './types.js';

/** 顺布起始地支序列 */
const SHUN_START: Branch[] = ['亥', '子', '丑', '寅', '卯', '辰'];
/** 逆布起始地支序列 */
const NI_START: Branch[] = ['巳', '午', '未', '申', '酉', '戌'];

/**
 * 判断昼夜
 *
 * @param shiZhi 占时地支
 * @returns true = 昼，false = 夜
 *
 * 卯辰巳午未申 = 昼（索引 3-8）
 * 酉戌亥子丑寅 = 夜（索引 9-11, 0-2）
 */
export function isDaytime(shiZhi: Branch): boolean {
  const idx = BRANCH_INDEX[shiZhi];
  return idx >= 3 && idx <= 8;
}

/**
 * 排布十二天将
 *
 * @param dayGan 日干
 * @param shiZhi 占时地支
 * @param tianDiPan 天地盘
 * @returns 天将信息
 */
export function layoutTianJiang(
  dayGan: Gan,
  shiZhi: Branch,
  tianDiPan: TianDiPan,
): TianJiangInfo {
  const daytime = isDaytime(shiZhi);

  // 获取贵人所在支
  const [guiRenDay, guiRenNight] = GUI_REN_TABLE[dayGan];
  const guiRenBranch = daytime ? guiRenDay : guiRenNight;

  // 判断顺逆
  const isShun = SHUN_START.includes(guiRenBranch);
  const direction: '顺' | '逆' = isShun ? '顺' : '逆';

  // 确定天将序列
  const jiangSequence = isShun ? TIAN_JIANG_SHUN : TIAN_JIANG_NI;

  // 找到贵人在天盘上的位置（地盘guiRenBranch对应的天盘位置）
  // 贵人布在天盘上的guiRenBranch所临之地盘位
  // 实际上：从天盘中找到guiRenBranch所在的位置
  // 天盘上guiRenBranch的位置 → 从该位置开始布将

  // 天盘中guiRenBranch在哪个地盘位上
  const guiRenTianPanIdx = tianDiPan.tianPan.indexOf(guiRenBranch);

  // 构建地支→天将映射
  const branchToJiang = {} as Record<Branch, TianJiangName>;

  for (let i = 0; i < 12; i++) {
    // 天将序号
    const jiangIdx = i;
    // 天盘位置（从贵人位开始顺/逆）
    const tianPanIdx = isShun
      ? (guiRenTianPanIdx + i) % 12
      : ((guiRenTianPanIdx - i) % 12 + 12) % 12;

    const branch = tianDiPan.diPan[tianPanIdx];
    branchToJiang[branch] = jiangSequence[jiangIdx];
  }

  return {
    guiRenBranch,
    direction,
    branchToJiang,
  };
}

/**
 * 获取某个地支所乘天将
 */
export function getTianJiang(
  branch: Branch,
  tianJiangInfo: TianJiangInfo,
): TianJiangName {
  return tianJiangInfo.branchToJiang[branch];
}
