/**
 * ⑦ 八专法
 *
 * 前提：干支同位（日干寄宫与日支相同）
 * 规则：
 *   阳日 → 初传 = 日干上神，在地盘顺数第三位（从日干上神位置开始顺数三）
 *   阴日 → 初传 = 日支上神（第三课的上神），在天盘逆数三
 *
 *   中传 = 初传在天盘所临之神（天地盘推导）
 *   末传 = 中传在天盘所临之神
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';
import { GAN_JI_GONG } from '../types.js';
import { getTianPanZhi } from '../tiandi-pan.js';
import { isYangGan, nextBranch, prevBranch } from '../constants.js';

/**
 * 八专法计算
 */
export function bazhuan(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  _tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 前提：干支同位 — 日干寄宫 == 日支
  const jiGong = GAN_JI_GONG[dayGan];
  if (jiGong !== dayZhi) return null;

  const isYang = isYangGan(dayGan);
  let chuChuan: Branch;

  if (isYang) {
    // 阳日 → 初传 = 日干上神，顺数第三位
    const ganUpper = siKe[0].upperGod;
    chuChuan = nextBranch(ganUpper, 3);
  } else {
    // 阴日 → 初传 = 日支上神（第三课），逆数三
    const zhiUpper = siKe[2].upperGod;
    chuChuan = prevBranch(zhiUpper, 3);
  }

  // 中传 = 末传 = 日干寄宫在天盘所临之神
  const zhongChuan = getTianPanZhi(jiGong, _tianDiPan);
  const moChuan = zhongChuan;

  return {
    chuChuan,
    zhongChuan,
    moChuan,
    geJu: '八专',
    details: `八专法：${isYang ? '阳' : '阴'}日，干支同位，初传${chuChuan}`,
  };
}
