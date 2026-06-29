/**
 * 三传调度器 — 九宗门级联
 *
 * 调度顺序：
 *   ① 先检查伏吟/返吟（天地盘特殊结构，优先级最高）
 *   ② 再按贼克→比用→涉害→遥克→昴星→别责→八专级联
 *   ③ 返吟法兜底（必定成功）
 *
 * 中传 = 初传本身在地盘所乘之神（初传转找天盘）
 * 末传 = 中传本身在地盘所乘之神
 */

import type { Branch, Gan, SiKeItem, TianDiPan, SanChuanResult } from './types.js';
import { zeke } from './jiuzongmen/zeke.js';
import { biyong } from './jiuzongmen/biyong.js';
import { shehai } from './jiuzongmen/shehai.js';
import { yaoke } from './jiuzongmen/yaoke.js';
import { maoxing } from './jiuzongmen/maoxing.js';
import { bieze } from './jiuzongmen/bieze.js';
import { bazhuan } from './jiuzongmen/bazhuan.js';
import { fuyin, isFuYin } from './jiuzongmen/fuyin.js';
import { fanyin } from './jiuzongmen/fanyin.js';
import { getTianPanZhi } from './tiandi-pan.js';

/**
 * 推导中传和末传
 *
 * 中传 = 初传所乘之神（以初传为地盘位，查天盘）
 * 末传 = 中传所乘之神
 */
export function deriveZhongMoChuan(
  chuChuan: Branch,
  tianDiPan: TianDiPan,
): [Branch, Branch] {
  const zhongChuan = getTianPanZhi(chuChuan, tianDiPan);
  const moChuan = getTianPanZhi(zhongChuan, tianDiPan);
  return [zhongChuan, moChuan];
}

/**
 * 九宗门级联调度
 */
export function calculateSanChuan(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult {
  // ① 伏吟法 — 天地盘相同，优先检查（结构条件）
  if (isFuYin(tianDiPan)) {
    const fuyinResult = fuyin(siKe, dayGan, dayZhi, tianDiPan);
    if (fuyinResult) return fuyinResult;
  }

  // ② 贼克法
  const zekeResult = zeke(siKe, dayGan, tianDiPan);
  if (zekeResult) return zekeResult;

  // ③ 比用法
  const biyongResult = biyong(siKe, dayGan, tianDiPan);
  if (biyongResult) return biyongResult;

  // ④ 涉害法
  const shehaiResult = shehai(siKe, dayGan, tianDiPan);
  if (shehaiResult) return shehaiResult;

  // ⑤ 遥克法
  const yaokeResult = yaoke(siKe, dayGan, dayZhi, tianDiPan);
  if (yaokeResult) return yaokeResult;

  // ⑥ 昴星法
  const maoxingResult = maoxing(siKe, dayGan, dayZhi, tianDiPan);
  if (maoxingResult) return maoxingResult;

  // ⑦ 别责法
  const biezeResult = bieze(siKe, dayGan, dayZhi, tianDiPan);
  if (biezeResult) return biezeResult;

  // ⑧ 八专法
  const bazhuanResult = bazhuan(siKe, dayGan, dayZhi, tianDiPan);
  if (bazhuanResult) return bazhuanResult;

  // ⑨ 返吟法（兜底，必定成功）
  return fanyin(siKe, dayGan, dayZhi, tianDiPan);
}
