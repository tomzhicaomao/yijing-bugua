/**
 * ⑤ 昴星法
 *
 * 前提：四课全为比和（四课均无克关系），且无遥克
 * 规则：
 *   阳日（日干为甲丙戊庚壬）：
 *     初传 = 酉（昴星）在天盘所临之神（即地盘酉位置的天盘神）
 *     中传 = 日支的上神（第三课的上神）
 *     末传 = 日干的上神（第一课的上神）
 *
 *   阴日（日干为乙丁己辛癸）：
 *     初传 = 酉在地盘所乘之神（天盘酉位置的地盘）
 *     中传 = 日干的上神（第一课的上神）
 *     末传 = 日支的上神（第三课的上神）
 *
 * 特殊情况：若初传与日干相同（伏吟昴星），特殊处理
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';

import { getTianPanZhi } from '../tiandi-pan.js';
import { isYangGan } from '../constants.js';
import { analyzeSiKe } from '../sike.js';

/**
 * 昴星法计算
 */
export function maoxing(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  _dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 前提：四课全比和
  const analysis = analyzeSiKe(siKe);
  if (!analysis.allBiHe) return null;

  // 酉在天盘所临之神（地盘酉位的天盘神）
  const youUpper = getTianPanZhi('酉', tianDiPan);

  // 日干上神（第一课上神）
  const ganUpper = siKe[0].upperGod;
  // 日支上神（第三课上神）
  const zhiUpper = siKe[2].upperGod;

  const isYang = isYangGan(dayGan);

  let chuChuan: Branch;
  let zhongChuan: Branch;
  let moChuan: Branch;

  if (isYang) {
    // 阳日
    chuChuan = youUpper;
    zhongChuan = zhiUpper;
    moChuan = ganUpper;
  } else {
    // 阴日：初传 = 酉在天盘位置的地盘支
    // 地盘酉位置的天盘是 youUpper，但阴日取的是天盘酉所在的地盘位
    // 实际上是找天盘上"酉"在哪个地盘位置
    // tianPan[diPanIdx] = tianZhi，我们要找 tianPan[idx] === '酉' 时的 diPan[idx]
    let youLower: Branch = '酉'; // fallback
    for (let i = 0; i < 12; i++) {
      if (tianDiPan.tianPan[i] === '酉') {
        youLower = tianDiPan.diPan[i];
        break;
      }
    }
    chuChuan = youLower;
    zhongChuan = ganUpper;
    moChuan = zhiUpper;
  }

  return {
    chuChuan,
    zhongChuan,
    moChuan,
    geJu: '昴星',
    details: `昴星法：${isYang ? '阳' : '阴'}日，初传${chuChuan}`,
  };
}
