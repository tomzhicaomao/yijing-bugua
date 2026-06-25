/**
 * 月建与日辰获取
 *
 * 基于固定基准的干支计算:
 *   年柱基准: 1900年 = 庚子年（六十甲子索引 36）
 *   日柱基准: 1900-01-01 = 甲戌日（六十甲子索引 10）
 *
 * 月建: 基于节气日近似映射（±1 天精度）
 *   立春(2/4)→寅, 惊蛰(3/6)→卯, 清明(4/5)→辰, ...
 *   五行旺衰: 以月建为准
 */

import type { Wuxing, TianGan, DiZhi, TimeContext } from '../types'

// ========== Data ==========

const TIAN_GAN: readonly TianGan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const DI_ZHI: readonly DiZhi[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const ZHI_WUXING: Record<DiZhi, Wuxing> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

const GAN_WUXING: Record<TianGan, Wuxing> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火',
  '戊': '土', '己': '土', '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
}

const ZHI_SEASON: Record<DiZhi, '春' | '夏' | '秋' | '冬'> = {
  '寅': '春', '卯': '春', '辰': '春',
  '巳': '夏', '午': '夏', '未': '夏',
  '申': '秋', '酉': '秋', '戌': '秋',
  '亥': '冬', '子': '冬', '丑': '冬',
}

const SEASON_WANG: Record<'春' | '夏' | '秋' | '冬', Wuxing[]> = {
  '春': ['木', '火'],
  '夏': ['火', '土'],
  '秋': ['金', '水'],
  '冬': ['水', '木'],
}

/** 节气日近似边界 */
const SHENG_CYCLE: Record<Wuxing, Wuxing> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
const KE_CYCLE: Record<Wuxing, Wuxing> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }

// ========== Public Functions ==========

/**
 * 获取给定时间的干支上下文
 */
export function getTimeContext(date: Date = new Date()): TimeContext {
  const dayResult = solarToGanzhi(date)
  const monthZhi = solarToMonthZhi(date)
  const yearPillar = getYearPillar(date.getFullYear())

  return {
    yearPillar,
    monthZhi,
    dayPillar: `${dayResult.stem}${dayResult.branch}`,
    dayStem: dayResult.stem,
    dayZhi: dayResult.branch,
    season: zhiToSeason(monthZhi),
    monthWuxing: zhiToWuxing(monthZhi),
    wangElements: [...SEASON_WANG[zhiToSeason(monthZhi)]],
  }
}

/**
 * 公历日期 → 日干支
 *
 * 基准: 1900-01-01 = 甲戌日（六十甲子中索引 10）
 */
export function solarToGanzhi(date: Date): { stem: TianGan; branch: DiZhi } {
  const reference = new Date(1900, 0, 1)
  const diffDays = Math.floor((date.getTime() - reference.getTime()) / (24 * 60 * 60 * 1000))
  const ganzhiIndex = ((diffDays + 10) % 60 + 60) % 60

  return {
    stem: TIAN_GAN[ganzhiIndex % 10],
    branch: DI_ZHI[ganzhiIndex % 12],
  }
}

/**
 * 获取年柱（年干支）
 *
 * 基准: 1900年 = 庚子年（六十甲子中索引 36）
 * 注意: 使用公历年份，与农历新年可能有 ±1 个月偏差
 */
export function getYearPillar(year: number): string {
  const index = ((year - 1900 + 36) % 60 + 60) % 60
  return `${TIAN_GAN[index % 10]}${DI_ZHI[index % 12]}`
}

/**
 * 公历日期 → 月建（近似，±1 天精度）
 */
export function solarToMonthZhi(date: Date): DiZhi {
  const month = date.getMonth() + 1
  const day = date.getDate()

  if (month === 1) return day >= 6 ? '丑' : '子'
  if (month === 2) return day >= 4 ? '寅' : '丑'
  if (month === 3) return day >= 6 ? '卯' : '寅'
  if (month === 4) return day >= 5 ? '辰' : '卯'
  if (month === 5) return day >= 6 ? '巳' : '辰'
  if (month === 6) return day >= 6 ? '午' : '巳'
  if (month === 7) return day >= 7 ? '未' : '午'
  if (month === 8) return day >= 8 ? '申' : '未'
  if (month === 9) return day >= 8 ? '酉' : '申'
  if (month === 10) return day >= 8 ? '戌' : '酉'
  if (month === 11) return day >= 7 ? '亥' : '戌'
  /* month === 12 */ return day >= 7 ? '子' : '亥'
}

/** 地支 → 季节 */
export function zhiToSeason(zhi: DiZhi): '春' | '夏' | '秋' | '冬' {
  return ZHI_SEASON[zhi]
}

/** 地支 → 五行 */
export function zhiToWuxing(zhi: DiZhi): Wuxing {
  return ZHI_WUXING[zhi]
}

/** 天干 → 五行 */
export function ganToWuxing(gan: TianGan): Wuxing {
  return GAN_WUXING[gan]
}

/**
 * 计算五行旺衰（以月建为准）
 * 旺: 同我者旺 · 相: 生我者相 · 休: 我生者休 · 囚: 我克者囚 · 死: 克我者死
 *
 * 例(午月火旺): 火=旺(同我), 木=相(生我·木生火),
 *               土=休(我生·火生土), 金=囚(我克·火克金),
 *               水=死(克我·水克火)
 */
export function determineWangShuai(
  element: Wuxing,
  monthWuxing: Wuxing,
): '旺' | '相' | '休' | '囚' | '死' {
  if (element === monthWuxing) return '旺'
  // 生我者相: element 生 month → 相
  if (SHENG_CYCLE[element] === monthWuxing) return '相'
  // 我生者休: month 生 element → 休
  if (SHENG_CYCLE[monthWuxing] === element) return '休'
  // 我克者囚: month 克 element → 囚
  if (KE_CYCLE[monthWuxing] === element) return '囚'
  // 克我者死: element 克 month → 死
  if (KE_CYCLE[element] === monthWuxing) return '死'
  return '休'
}
