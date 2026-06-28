/**
 * 三传调度器 — 九宗门级联
 *
 * 按序尝试 ①→②→...→⑨
 * ① 贼克法 → ② 比用法 → ③ 涉害法 → ④ 遥克法
 * → ⑤ 昴星法 → ⑥ 别责法 → ⑦ 八专法 → ⑧ 伏吟法 → ⑨ 返吟法
 *
 * 中传 = 初传本身在地盘所乘之神（初传转找天盘）
 * 末传 = 中传本身在地盘所乘之神
 */

import type { Branch, Gan, SiKeItem, TianDiPan, SanChuanResult, GeJu } from './types.js';
import { zeke } from './jiuzongmen/zeke.js';
import { biyong } from './jiuzongmen/biyong.js';
import { shehai } from './jiuzongmen/shehai.js';
import { yaoke } from './jiuzongmen/yaoke.js';
import { maoxing } from './jiuzongmen/maoxing.js';
import { bieze } from './jiuzongmen/bieze.js';
import { bazhuan } from './jiuzongmen/bazhuan.js';
import { fuyin } from './jiuzongmen/fuyin.js';
import { fanyin } from './jiuzongmen/fanyin.js';
import { getTianPanZhi } from './tiandi-pan.js';

/**
 * 推导中传和末传
 *
 * 中传 = 初传在地盘所乘之神（以初传为地盘位，查天盘）
 * 末传 = 中传在地盘所乘之神
 *
 * 注意：这里是 "初传在天盘所临之位的地盘上神"
 * 实际上是：以初传为天盘地支，找到它在地盘上的位置，再查该位置的天盘
 * 但更准确的说法是：初传的上神（天地盘查询）
 */
export function deriveZhongMoChuan(
  chuChuan: Branch,
  tianDiPan: TianDiPan,
): [Branch, Branch] {
  // 中传 = 初传所乘之神（以初传为地盘位，查天盘）
  const zhongChuan = getTianPanZhi(chuChuan, tianDiPan);
  // 末传 = 中传所乘之神
  const moChuan = getTianPanZhi(zhongChuan, tianDiPan);
  return [zhongChuan, moChuan];
}

/**
 * 九宗门级联调度
 *
 * @param siKe 四课
 * @param dayGan 日干
 * @param dayZhi 日支
 * @param tianDiPan 天地盘
 * @returns 三传结果
 */
export function calculateSanChuan(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  dayGan: Gan,
  dayZhi: Branch,
  tianDiPan: TianDiPan,
): SanChuanResult {
  // ① 贼克法
  const zekeResult = zeke(siKe, dayGan, tianDiPan);
  if (zekeResult) return zekeResult;

  // ② 比用法（处理多个候选）
  const biyongResult = biyong(siKe, dayGan, tianDiPan);
  if (biyongResult) return biyongResult;

  // ③ 涉害法
  const shehaiResult = shehai(siKe, dayGan, tianDiPan);
  if (shehaiResult) return shehaiResult;

  // ④ 遥克法
  const yaokeResult = yaoke(siKe, dayGan, dayZhi, tianDiPan);
  if (yaokeResult) return yaokeResult;

  // ⑤ 昴星法
  const maoxingResult = maoxing(siKe, dayGan, dayZhi, tianDiPan);
  if (maoxingResult) return maoxingResult;

  // ⑥ 别责法
  const biezeResult = bieze(siKe, dayGan, dayZhi, tianDiPan);
  if (biezeResult) return biezeResult;

  // ⑦ 八专法
  const bazhuanResult = bazhuan(siKe, dayGan, dayZhi, tianDiPan);
  if (bazhuanResult) return bazhuanResult;

  // ⑧ 伏吟法
  const fuyinResult = fuyin(siKe, dayGan, dayZhi, tianDiPan);
  if (fuyinResult) return fuyinResult;

  // ⑨ 返吟法（兜底，必定成功）
  return fanyin(siKe, dayGan, dayZhi, tianDiPan);
}
