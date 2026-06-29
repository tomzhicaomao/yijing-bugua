/**
 * 天地盘构建
 *
 * 地盘：固定十二地支（子丑寅卯...亥）
 * 天盘：月将加占时 → 天盘旋转
 * 示例：月将=亥，占时=寅 → 天盘亥对地盘寅
 */

import type { Branch, TianDiPan } from './types.js';
import { ALL_BRANCHES, BRANCH_INDEX } from './types.js';

/**
 * 构建天地盘
 *
 * @param yueJiang 月将地支
 * @param shiZhi 占时地支
 * @returns 天地盘数据
 */
export function buildTianDiPan(yueJiang: Branch, shiZhi: Branch): TianDiPan {
  const diPan = [...ALL_BRANCHES];                    // 固定地盘 [子,丑,寅...亥]
  const yueJiangIdx = BRANCH_INDEX[yueJiang];
  const shiZhiIdx = BRANCH_INDEX[shiZhi];

  // 天盘：月将对占时 — "月将加占时"
  // 规则：天盘上的月将位 = 地盘上的占时位
  // 即：tianPan[shiZhiIdx] = yueJiang
  // 推导：ALL_BRANCHES[(shiZhiIdx + offset) % 12] = yueJiang
  //       offset = (yueJiangIdx - shiZhiIdx + 12) % 12
  const offset = ((yueJiangIdx - shiZhiIdx) % 12 + 12) % 12;

  // 对地盘进行循环移位（天盘起点 = 偏移量）
  const tianPan: Branch[] = [];
  for (let i = 0; i < 12; i++) {
    tianPan.push(ALL_BRANCHES[(i + offset) % 12]);
  }

  // 构建地→天映射
  const diToTian = {} as Record<Branch, Branch>;
  for (let i = 0; i < 12; i++) {
    const diZhi = diPan[i];
    const tianZhi = tianPan[i];
    diToTian[diZhi] = tianZhi;
  }

  return { diPan, tianPan, diToTian };
}

/**
 * 获取地盘某支所乘天盘地支
 *
 * @param diZhi 地盘地支
 * @param tianDiPan 天地盘
 * @returns 天盘对应地支
 */
export function getTianPanZhi(diZhi: Branch, tianDiPan: TianDiPan): Branch {
  return tianDiPan.diToTian[diZhi];
}
