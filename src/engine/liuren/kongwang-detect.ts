/**
 * 空亡检测
 *
 * 检测四课、三传中是否有空亡地支
 * 空亡 = 日干支所在旬中缺少的两个地支
 */

import type { Branch, Gan, SiKeItem, SanChuanItem } from './types.js';

/**
 * 空亡检测结果
 */
export interface KongWangResult {
  nullBranches: [Branch, Branch];   // 空亡的两个地支
  inSiKe: Array<{ index: number; branch: Branch; position: '上' | '下' }>;
  inSanChuan: Array<{ index: number; branch: Branch; name: string }>;
  warnings: string[];
}

/**
 * 计算空亡地支
 *
 * @param dayGan 日干
 * @param dayZhi 日支
 * @returns 空亡的两个地支
 */
export function calcKongWang(dayGan: Gan, dayZhi: Branch): [Branch, Branch] {
  const ganOrder: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhiOrder: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  const dayGanIdx = ganOrder.indexOf(dayGan);
  const dayZhiIdx = zhiOrder.indexOf(dayZhi);
  const xunStartZhiIdx = (dayZhiIdx - dayGanIdx + 12) % 12;

  return [
    zhiOrder[(xunStartZhiIdx + 10) % 12],
    zhiOrder[(xunStartZhiIdx + 11) % 12],
  ];
}

/**
 * 检测课式中的空亡
 *
 * @param siKe 四课
 * @param sanChuan 三传
 * @param dayGan 日干
 * @param dayZhi 日支
 * @returns 空亡检测结果
 */
export function detectKongWang(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  sanChuan: [SanChuanItem, SanChuanItem, SanChuanItem],
  dayGan: Gan,
  dayZhi: Branch,
): KongWangResult {
  const [null1, null2] = calcKongWang(dayGan, dayZhi);
  const nullSet = new Set<Branch>([null1, null2]);

  const inSiKe: KongWangResult['inSiKe'] = [];
  const inSanChuan: KongWangResult['inSanChuan'] = [];
  const warnings: string[] = [];

  // 检查四课
  siKe.forEach((item, idx) => {
    if (nullSet.has(item.upperGod)) {
      inSiKe.push({ index: idx, branch: item.upperGod, position: '上' });
    }
    if (nullSet.has(item.lowerGod)) {
      inSiKe.push({ index: idx, branch: item.lowerGod, position: '下' });
    }
  });

  // 检查三传
  const names = ['初传', '中传', '末传'];
  sanChuan.forEach((item, idx) => {
    if (nullSet.has(item.branch)) {
      inSanChuan.push({ index: idx, branch: item.branch, name: names[idx] });
    }
  });

  // 生成警告
  if (inSiKe.length > 0) {
    warnings.push(`四课中见空亡（${null1}、${null2}）：${inSiKe.map(i => `第${i.index + 1}课${i.position}神`).join('、')}`);
  }
  if (inSanChuan.length > 0) {
    warnings.push(`三传中见空亡：${inSanChuan.map(i => i.name).join('、')}，事多不成`);
  }

  return {
    nullBranches: [null1, null2],
    inSiKe,
    inSanChuan,
    warnings,
  };
}
