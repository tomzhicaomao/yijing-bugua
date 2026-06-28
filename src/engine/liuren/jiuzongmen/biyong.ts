/**
 * ② 比用法
 *
 * 前提：贼克法返回了多个候选上神（多个下贼上或多个上克下）
 * 规则：取与日干阴阳相同者
 *   日干为阳（甲丙戊庚壬）→ 取候选中的阳支（子寅辰午申戌）
 *   日干为阴（乙丁己辛癸）→ 取候选中的阴支（丑卯巳未酉亥）
 *   若仍有多个符合 → 返回 null（进入涉害法）
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';
import { deriveZhongMoChuan } from '../sanchuan.js';
import { getZekeCandidates } from './zeke.js';
import { isYangGan, isYangBranch } from '../constants.js';

/**
 * 比用法计算
 *
 * @returns 三传结果，或 null（多个同阴阳时交由涉害法）
 */
export function biyong(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 获取贼克法的候选
  const zekeResult = getZekeCandidates(siKe);
  if (!zekeResult) return null;

  const { candidates, type } = zekeResult;

  // 如果只有一个候选，不应该进入比用法
  if (candidates.length <= 1) return null;

  // 判断日干阴阳
  const isYang = isYangGan(dayGan);

  // 过滤出与日干同阴阳的候选
  const filtered = candidates.filter(branch => isYangBranch(branch) === isYang);

  if (filtered.length === 1) {
    // 恰好一个 → 取为初传
    const chuChuan = filtered[0];
    const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);
    const geJu = type === '下贼上' ? '知一' : '知一';
    return {
      chuChuan,
      zhongChuan,
      moChuan,
      geJu,
      details: `比用法：日干${dayGan}(${isYang ? '阳' : '阴'})，取${isYang ? '阳' : '阴'}支${chuChuan}`,
    };
  }

  // 多个或零个同阴阳 → null，交由涉害法
  return null;
}
