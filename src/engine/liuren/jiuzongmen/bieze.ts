/**
 * ⑥ 别责法
 *
 * 前提：四课中有三课相同（即两课完全重复）
 * 规则：
 *   阳日 → 初传 = 日干合神寄宫的上神
 *   阴日 → 初传 = 日支三合的前一位上神
 *
 *   中传 = 末传 = 初传（三传相同）
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';
import { GAN_JI_GONG } from '../types.js';
import { getTianPanZhi } from '../tiandi-pan.js';
import { isYangGan, GAN_HE, SAN_HE } from '../constants.js';

/**
 * 检查四课是否只有三课（有重复）
 * 返回 true 如果四课中有重复（实际有效课 < 4）
 */
function hasDuplicateSiKe(siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem]): boolean {
  const keys = siKe.map(item => `${item.upperGod}-${item.lowerGod}`);
  const uniqueKeys = new Set(keys);
  return uniqueKeys.size < 4;
}

/**
 * 别责法计算
 */
export function bieze(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 前提：四课中有重复
  if (!hasDuplicateSiKe(siKe)) return null;

  const isYang = isYangGan(dayGan);
  let chuChuan: Branch;

  if (isYang) {
    // 阳日 → 日干合神寄宫的上神
    // 例如：甲日，甲己合→己，己寄宫未，取未上神
    const heGan: Gan = GAN_HE[dayGan];
    const heJiGong: Branch = GAN_JI_GONG[heGan];
    chuChuan = getTianPanZhi(heJiGong, tianDiPan);
  } else {
    // 阴日 → 日支三合的前一位上神
    // 例如：日支丑→巳酉丑三合，取巳上神（丑的前一合）
    const sanHe = SAN_HE[dayZhi];
    const [a, b, _wx] = sanHe;
    // 找三合中在日支之前的那个
    // 巳酉丑：日支丑→前一位是巳
    // 判断逻辑：三合中不是日支的两个，取顺时针前一个
    const branches: Branch[] = [a, b, dayZhi];
    // 排序：按地支顺序
    const sorted = [...branches].sort((x, y) => {
      const order = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      return order.indexOf(x) - order.indexOf(y);
    });
    const dayIdx = sorted.indexOf(dayZhi);
    const prevIdx = (dayIdx - 1 + 3) % 3;
    const prevBranch = sorted[prevIdx];
    chuChuan = getTianPanZhi(prevBranch, tianDiPan);
  }

  // 中传 = 末传 = 初传
  return {
    chuChuan,
    zhongChuan: chuChuan,
    moChuan: chuChuan,
    geJu: '别责',
    details: `别责法：${isYang ? '阳' : '阴'}日，初传${chuChuan}`,
  };
}
