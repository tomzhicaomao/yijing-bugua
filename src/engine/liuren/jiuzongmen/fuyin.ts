/**
 * ⑧ 伏吟法
 *
 * 前提：天地盘完全相同（天盘未旋转/月将=占时）
 * 规则：
 *   阳日 → 初传 = 日干上神
 *   阴日 → 初传 = 日支上神
 *
 *   中传 = 初传的刑神
 *   末传 = 中传的刑神
 *
 * 特殊情况：若中传自刑
 *   → 阳日取日支上神为中传，阴日取日干上神为中传
 *   → 若仍自刑，取日马为中传
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';
import { isYangGan, XING_MAP, RI_MA_MAP } from '../constants.js';


/**
 * 判断是否伏吟（天地盘相同）
 */
export function isFuYin(tianDiPan: TianDiPan): boolean {
  for (let i = 0; i < 12; i++) {
    if (tianDiPan.diPan[i] !== tianDiPan.tianPan[i]) {
      return false;
    }
  }
  return true;
}

/**
 * 伏吟法计算
 */
export function fuyin(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 前提：伏吟（天地盘相同）
  if (!isFuYin(tianDiPan)) return null;

  const isYang = isYangGan(dayGan);

  // 初传
  const chuChuan = isYang ? siKe[0].upperGod : siKe[2].upperGod;

  // 中传 = 初传的刑神
  let zhongChuan = XING_MAP[chuChuan];

  // 检查是否自刑
  const isChuSelfXing = chuChuan === zhongChuan;
  if (isChuSelfXing) {
    // 自刑 → 阳日取日支上神，阴日取日干上神
    zhongChuan = isYang ? siKe[2].upperGod : siKe[0].upperGod;

    // 检查替代中传是否也自刑
    const altXing = XING_MAP[zhongChuan];
    if (zhongChuan === altXing) {
      // 仍自刑 → 取日马
      zhongChuan = RI_MA_MAP[dayZhi];
    }
  }

  // 末传 = 中传的刑神
  let moChuan = XING_MAP[zhongChuan];

  // 检查末传是否自刑
  if (zhongChuan === moChuan) {
    // 自刑 → 阳日取日支上神，阴日取日干上神
    moChuan = isYang ? siKe[2].upperGod : siKe[0].upperGod;

    // 检查替代末传是否也自刑
    const altXing = XING_MAP[moChuan];
    if (moChuan === altXing) {
      moChuan = RI_MA_MAP[dayZhi];
    }
  }

  return {
    chuChuan,
    zhongChuan,
    moChuan,
    geJu: '伏吟',
    details: `伏吟法：${isYang ? '阳' : '阴'}日，初传${chuChuan}，中传${zhongChuan}，末传${moChuan}`,
  };
}
