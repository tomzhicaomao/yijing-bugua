/**
 * ① 贼克法
 *
 * 规则：
 *   1. 遍历四课，找出所有"下贼上"（下神克上神）
 *   2. 若有"下贼上"：
 *      a. 仅一个 → 取下贼上的上神为初传
 *      b. 多个 → 返回多个候选（交由比用法决疑）
 *   3. 若无"下贼上"，找所有"上克下"：
 *      a. 仅一个 → 取上克下的上神为初传
 *      b. 多个 → 返回多个候选
 *   4. 既无下贼上也无上克下 → 返回 null
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan } from '../types.js';
import { deriveZhongMoChuan } from '../sanchuan.js';

/**
 * 贼克法计算
 *
 * @returns 三传结果（单一结果时），或包含候选的特殊结果，或 null
 */
export function zeke(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  _dayGan: Gan,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 收集所有下贼上
  const xiaZeShang: Branch[] = [];
  siKe.forEach(item => {
    if (item.relation === '下贼上') {
      xiaZeShang.push(item.upperGod);
    }
  });

  // 有下贼上
  if (xiaZeShang.length > 0) {
    if (xiaZeShang.length === 1) {
      // 仅一个 → 直接取为初传
      const chuChuan = xiaZeShang[0];
      const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);
      return {
        chuChuan,
        zhongChuan,
        moChuan,
        geJu: '重审',
        details: '下贼上，重审课',
      };
    }
    // 多个下贼上 → 返回 null，交由比用法
    return null;
  }

  // 无下贼上，找上克下
  const keShangXia: Branch[] = [];
  siKe.forEach(item => {
    if (item.relation === '上克下') {
      keShangXia.push(item.upperGod);
    }
  });

  if (keShangXia.length > 0) {
    if (keShangXia.length === 1) {
      // 仅一个上克下 → 取为初传
      const chuChuan = keShangXia[0];
      const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);
      return {
        chuChuan,
        zhongChuan,
        moChuan,
        geJu: '元首',
        details: '上克下，元首课',
      };
    }
    // 多个上克下 → 返回 null，交由比用法
    return null;
  }

  // 既无下贼上也无上克下 → null
  return null;
}

/**
 * 获取贼克法的候选上神列表（供比用法使用）
 */
export function getZekeCandidates(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
): { candidates: Branch[]; type: '下贼上' | '上克下' } | null {
  // 先检查下贼上
  const xiaZeShang: Branch[] = [];
  siKe.forEach(item => {
    if (item.relation === '下贼上') {
      xiaZeShang.push(item.upperGod);
    }
  });

  if (xiaZeShang.length > 0) {
    return { candidates: xiaZeShang, type: '下贼上' };
  }

  // 再检查上克下
  const keShangXia: Branch[] = [];
  siKe.forEach(item => {
    if (item.relation === '上克下') {
      keShangXia.push(item.upperGod);
    }
  });

  if (keShangXia.length > 0) {
    return { candidates: keShangXia, type: '上克下' };
  }

  return null;
}
