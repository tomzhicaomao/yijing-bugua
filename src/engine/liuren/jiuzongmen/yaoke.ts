/**
 * ④ 遥克法
 *
 * 前提：四课无克（贼克法返回 null）
 * 规则：
 *   1. 遍历四课，找"日干遥克上神"（即日干克四课的上神）→ 取该上神为初传
 *   2. 若无，找"上神遥克日干"（即上神克日干）→ 取该上神为初传
 *   3. 均无 → null
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan, WuXing } from '../types.js';
import { GAN_WUXING, BRANCH_WUXING } from '../types.js';
import { KE_MATRIX } from '../constants.js';
import { deriveZhongMoChuan } from '../sanchuan.js';
import { analyzeSiKe } from '../sike.js';

/**
 * 遥克法计算
 */
export function yaoke(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  _dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 先确认四课无克
  const analysis = analyzeSiKe(siKe);
  if (analysis.hasKe) return null;

  const dayWuXing: WuXing = GAN_WUXING[dayGan];

  // 收集四课上神（去重）
  const upperGods: Branch[] = siKe.map(item => item.upperGod);

  // 1. 日干遥克上神（日干克上神）
  const ganKeUpper: Branch[] = [];
  upperGods.forEach(god => {
    const godWuXing: WuXing = BRANCH_WUXING[god];
    if (KE_MATRIX[dayWuXing][godWuXing]) {
      ganKeUpper.push(god);
    }
  });

  if (ganKeUpper.length === 1) {
    const chuChuan = ganKeUpper[0];
    const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);
    return {
      chuChuan,
      zhongChuan,
      moChuan,
      geJu: '遥克',
      details: `遥克法：日干${dayGan}遥克上神${chuChuan}`,
    };
  }

  // 2. 上神遥克日干（上神克日干）
  const upperKeGan: Branch[] = [];
  upperGods.forEach(god => {
    const godWuXing: WuXing = BRANCH_WUXING[god];
    if (KE_MATRIX[godWuXing][dayWuXing]) {
      upperKeGan.push(god);
    }
  });

  if (upperKeGan.length === 1) {
    const chuChuan = upperKeGan[0];
    const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);
    return {
      chuChuan,
      zhongChuan,
      moChuan,
      geJu: '遥克',
      details: `遥克法：上神${chuChuan}遥克日干${dayGan}`,
    };
  }

  // 3. 均无 → null
  return null;
}
