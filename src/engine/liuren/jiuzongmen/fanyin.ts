/**
 * ⑨ 返吟法
 *
 * 前提：天盘与地盘的十二地支完全相冲（每地支冲位）
 * 规则：
 *   1. 找出四课中克日干的课（上神克日干）→ 取该上神为初传
 *   2. 若有多个 → 用比用法
 *   3. 若无克日干 → 取驿马（日马）为初传
 *
 *   中传 = 初传本身在地盘所乘之神
 *   末传 = 中传本身在地盘所乘之神
 *
 * 返吟法是兜底法，必定成功
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan, WuXing } from '../types.js';
import { GAN_WUXING, BRANCH_WUXING } from '../types.js';
import { KE_MATRIX, CHONG_MAP, RI_MA_MAP, isYangBranch, isYangGan } from '../constants.js';
import { getTianPanZhi } from '../tiandi-pan.js';

/**
 * 判断是否返吟（天地盘完全相冲）
 */
export function isFanYin(tianDiPan: TianDiPan): boolean {
  for (let i = 0; i < 12; i++) {
    if (CHONG_MAP[tianDiPan.diPan[i]] !== tianDiPan.tianPan[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 返吟法计算（兜底法，必定成功）
 */
export function fanyin(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult {
  const dayWuXing: WuXing = GAN_WUXING[dayGan];

  // 找出四课中克日干的上神
  const keGanCandidates: Branch[] = [];
  siKe.forEach(item => {
    const upperWuXing: WuXing = BRANCH_WUXING[item.upperGod];
    if (KE_MATRIX[upperWuXing][dayWuXing]) {
      keGanCandidates.push(item.upperGod);
    }
  });

  let chuChuan: Branch;

  if (keGanCandidates.length === 1) {
    // 只有一个克日干 → 取为初传
    chuChuan = keGanCandidates[0];
  } else if (keGanCandidates.length > 1) {
    // 多个 → 用比用法（取与日干同阴阳者）
    const isYang = isYangGan(dayGan);
    const filtered = keGanCandidates.filter(b => isYangBranch(b) === isYang);

    if (filtered.length === 1) {
      chuChuan = filtered[0];
    } else if (filtered.length > 1) {
      // 仍有多个，取第一个出现的
      chuChuan = filtered[0];
    } else {
      // 无同阴阳，取第一个
      chuChuan = keGanCandidates[0];
    }
  } else {
    // 无克日干 → 取驿马
    chuChuan = RI_MA_MAP[dayZhi];
  }

  // 中传 = 初传在地盘所乘之神
  const zhongChuan = getTianPanZhi(chuChuan, tianDiPan);
  // 末传 = 中传在地盘所乘之神
  const moChuan = getTianPanZhi(zhongChuan, tianDiPan);

  return {
    chuChuan,
    zhongChuan,
    moChuan,
    geJu: '返吟',
    details: `返吟法：初传${chuChuan}，中传${zhongChuan}，末传${moChuan}`,
  };
}
