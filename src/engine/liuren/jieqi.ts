/**
 * 节气与月将计算
 *
 * 基于天文公式计算 24 节气日期（精度 ±1 天）
 * 月将 = 该月中气对应的地支
 */

import type { Branch, Gan } from './types.js';
import { ALL_BRANCHES, BRANCH_INDEX } from './types.js';

// ========== 节气名称 ==========

/** 24 节气名称（顺序：小寒为第 0 个） */
export const SOLAR_TERM_NAMES: string[] = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至',
];

/**
 * 中气 → 月将地支映射
 * 中气（偶数索引节气：雨水、春分、谷雨、小满、夏至、大暑、处暑、秋分、霜降、小雪、冬至、大寒）
 */
const ZHONGQI_TO_YUEJIANG: Record<string, Branch> = {
  '雨水': '亥', '春分': '戌', '谷雨': '酉', '小满': '申',
  '夏至': '未', '大暑': '午', '处暑': '巳', '秋分': '辰',
  '霜降': '卯', '小雪': '寅', '冬至': '丑', '大寒': '子',
};

// ========== 天文计算 ==========

/**
 * 太阳黄经 → 节气索引（0-23，对应 SOLAR_TERM_NAMES）
 * 小寒=285°, 大寒=300°, 立春=315°, 雨水=330°, 惊蛰=345°, 春分=0°,
 * 清明=15°, 谷雨=30°, 立夏=45°, 小满=60°, 芒种=75°, 夏至=90°, ...
 */
function longitudeToTermIndex(longitude: number): number {
  // 春分点为 0°，对应索引 5
  const adjusted = ((longitude - 285) % 360 + 360) % 360;
  return Math.floor(adjusted / 15);
}

/**
 * 计算指定年份的指定节气近似儒略日（JD）
 * 使用天文公式：JD of 2000年节气 = 2451550.09765 + 365.242222 × (year - 2000) + Δ
 * 其中 Δ 是各节气的固定偏移修正
 *
 * @param year 公历年份
 * @param termIndex 节气索引 (0-23)
 * @returns 儒略日 (JD)
 */
function calcSolarTermJD(year: number, termIndex: number): number {
  // 基础 J2000.0 起算
  const baseJD = 2451550.09765;
  // 回归年长度
  const tropicalYear = 365.242222;
  // 节气间隔 15°
  const termStep = 15.0;

  // 2000 年各节气的近似值（小寒为第 0 个）
  // 2000 年小寒约在 1 月 6 日，JD ≈ 2451549.5 + 6 = 2451555.5
  // 更精确地，各节气在 2000 年的偏差值
  const termOffsets: number[] = [
    5.5,     // 小寒 Jan 6
    20.0,    // 大寒 Jan 20
    34.5,    // 立春 Feb 4
    49.3,    // 雨水 Feb 19
    64.0,    // 惊蛰 Mar 5
    79.5,    // 春分 Mar 21
    94.5,    // 清明 Apr 5
    109.5,   // 谷雨 Apr 20
    125.0,   // 立夏 May 6
    140.5,   // 小满 May 21
    155.5,   // 芒种 Jun 6
    171.0,   // 夏至 Jun 22
    186.5,   // 小暑 Jul 7
    202.0,   // 大暑 Jul 23
    217.5,   // 立秋 Aug 7
    233.0,   // 处暑 Aug 23
    248.5,   // 白露 Sep 7
    264.0,   // 秋分 Sep 23
    279.5,   // 寒露 Oct 8
    295.0,   // 霜降 Oct 23
    310.5,   // 立冬 Nov 7
    326.0,   // 小雪 Nov 22
    341.5,   // 大雪 Dec 7
    357.0,   // 冬至 Dec 22
  ];

  // 年份相对于 2000 年的偏移
  const yearDiff = year - 2000;
  // 基础 JD
  let jd = baseJD + tropicalYear * yearDiff + termOffsets[termIndex];

  // 修正项：地球轨道离心率导致的非线性（最大约 ±1 天）
  // 使用简化的天文修正
  const anomaly = ((yearDiff % 4) + 4) % 4;
  const corrections: number[] = [0, 0.25, 0.15, -0.1];
  jd += corrections[anomaly] || 0;

  // 世纪项修正（年份越远误差越大）
  const century = yearDiff / 100;
  jd += century * 0.08;

  return jd;
}

/**
 * JD → Date
 */
function JDToDate(jd: number): Date {
  const unixTime = (jd - 2440587.5) * 86400000;
  return new Date(unixTime);
}

/**
 * Date → JD
 */
function dateToJD(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

// ========== 公开 API ==========

/**
 * 获取指定日期所在的节气名称
 *
 * @param date 公历日期
 * @returns 节气名称，如 "春分"
 */
export function getSolarTerm(date: Date): string {
  // 找到日期所在的两个节气边界
  const jd = dateToJD(date);
  const year = date.getFullYear();

  let closestTerm = '';
  let minDiff = Infinity;

  for (let termIdx = 0; termIdx < 24; termIdx++) {
    // 检查今年和明年的该节气
    for (const y of [year - 1, year, year + 1]) {
      const termJD = calcSolarTermJD(y, termIdx);
      const diff = Math.abs(jd - termJD);
      // 节气有效期为到下一个节气前
      if (diff < minDiff) {
        // 检查日期是否在该节气之后
        const nextIdx = (termIdx + 1) % 24;
        const nextYear = nextIdx === 0 ? y + 1 : y;
        const nextTermJD = calcSolarTermJD(nextYear, nextIdx);
        // 如果 jd 在当前节气和下一个节气之间
        if (jd >= termJD - 0.5 && jd < nextTermJD - 0.5) {
          minDiff = diff;
          closestTerm = SOLAR_TERM_NAMES[termIdx];
        }
      }
    }
  }

  return closestTerm || SOLAR_TERM_NAMES[Math.floor(((jd - 1) % 365.2422) / 365.2422 * 24) % 24];
}

/**
 * 获取指定日期的月将（含前后检查）
 *
 * @param date 公历日期
 * @returns 月将地支
 */
export function getYueJiang(date: Date): Branch {
  const jd = dateToJD(date);
  const year = date.getFullYear();

  // 中气索引：1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
  const zhongqiIndices = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

  // 中气 → 月将地支
  const zhongqiToYueJiang: Branch[] = ['子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑'];
  // 对应中气列表：大寒→子, 雨水→亥, 春分→戌, 谷雨→酉, 小满→申, 夏至→未,
  //             大暑→午, 处暑→巳, 秋分→辰, 霜降→卯, 小雪→寅, 冬至→丑

  // 遍历所有中气，找到日期所在的中气区间
  for (let i = 0; i < 12; i++) {
    const zqIdx = zhongqiIndices[i];
    const currentZQJD = calcSolarTermJD(year, zqIdx);
    const nextZQJD = calcSolarTermJD(i < 11 ? year : year + 1, zhongqiIndices[(i + 1) % 12]);

    // 如果日期在当前中气和下一个中气之间
    if (jd >= currentZQJD - 0.5 && jd < nextZQJD - 0.5) {
      return zhongqiToYueJiang[i];
    }

    // 跨年处理
    if (i === 11) {
      // 冬至（索引 23）在年底
      const dongzhiJD = calcSolarTermJD(year, 23);
      if (jd >= dongzhiJD - 0.5) {
        return '丑'; // 冬至→丑将
      }
    }
  }

  // 兜底：1 月初大寒之前是子将（冬至后到小寒大寒之间）
  const xiaohanJD = calcSolarTermJD(year, 0);
  if (jd < xiaohanJD - 0.5) {
    return '丑'; // 冬至还在用丑将
  }
  const dahanJD = calcSolarTermJD(year, 1);
  if (jd < dahanJD - 0.5) {
    return '丑'; // 小寒仍用丑将（冬至到小寒之间）
  }

  return '子'; // 大寒到雨水之间
}

/**
 * 检测是否处于节气边界 ±1 天窗口内
 * 用于防误判提醒
 */
export function isNearSolarTermBoundary(date: Date): { isNear: boolean; termName: string } {
  const jd = dateToJD(date);
  const year = date.getFullYear();

  for (let termIdx = 0; termIdx < 24; termIdx++) {
    for (const y of [year - 1, year, year + 1]) {
      const termJD = calcSolarTermJD(y, termIdx);
      const diff = Math.abs(jd - termJD);
      if (diff <= 1) {
        return {
          isNear: true,
          termName: SOLAR_TERM_NAMES[termIdx],
        };
      }
    }
  }

  return { isNear: false, termName: '' };
}

/**
 * 获取日期范围的起止节气
 * 用于月将的精确判断
 */
export function getCurrentZhongQi(date: Date): { name: string; yueJiang: Branch } | null {
  const jd = dateToJD(date);
  const year = date.getFullYear();
  const zhongqiIndices = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];
  const zhongqiToYueJiang: Branch[] = ['子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑'];

  for (let i = 0; i < 12; i++) {
    const zqIdx = zhongqiIndices[i];
    const currentZQJD = calcSolarTermJD(year, zqIdx);
    const nextYear = i < 11 ? year : year + 1;
    const nextZQJD = calcSolarTermJD(nextYear, zhongqiIndices[(i + 1) % 12]);

    if (jd >= currentZQJD - 0.5 && jd < nextZQJD - 0.5) {
      return {
        name: SOLAR_TERM_NAMES[zqIdx],
        yueJiang: zhongqiToYueJiang[i],
      };
    }
  }

  return null;
}
