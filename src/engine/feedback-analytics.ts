/**
 * 反馈数据分析引擎
 *
 * 从用户反馈数据中生成按类别/卦象/claim类型的准确率分析
 * 前置条件: ≥100 条带反馈记录后执行有统计意义
 */

import type { DivinationRecord, Category, Trend, ClaimType } from '../types'
import { lookupHexagram } from './hexagram-lookup.js'

// ========== 分析维度类型 ==========

export interface ClaimTypePerformance {
  type: ClaimType
  hitCount: number
  missCount: number
  unclearCount: number
  hitRate: number
}

export interface CategoryAccuracy {
  category: Category
  totalDivinations: number
  feedbackCount: number
  accurateCount: number
  inaccurateCount: number
  unclearCount: number
  accuracyRate: number
  feedbackResponseRate: number
  byClaimType: ClaimTypePerformance[]
}

export interface HexagramPerformance {
  hexagramId: number
  name: string
  totalDivinations: number
  accuracyRate: number
  commonTrend: Trend | null
}

export interface AnalyticsReport {
  generatedAt: string
  totalRecords: number
  recordsWithFeedback: number
  overallAccuracy: number
  categoryAccuracy: CategoryAccuracy[]
  topHexagrams: HexagramPerformance[]
  worstHexagrams: HexagramPerformance[]
  claimTypePerformance: ClaimTypePerformance[]
}

// ========== 分析函数 ==========

export function generateAnalyticsReport(records: DivinationRecord[]): AnalyticsReport {
  const fb = records.filter(r =>
    r.feedback.status === 'accurate' || r.feedback.status === 'inaccurate' || r.feedback.status === 'unclear',
  )
  const accurate = fb.filter(r => r.feedback.status === 'accurate').length
  const inaccurate = fb.filter(r => r.feedback.status === 'inaccurate').length
  const sumAI = accurate + inaccurate

  return {
    generatedAt: new Date().toISOString(),
    totalRecords: records.length,
    recordsWithFeedback: fb.length,
    overallAccuracy: sumAI > 0 ? accurate / sumAI : 0,
    categoryAccuracy: computeCategoryAccuracy(records, fb),
    topHexagrams: computeHexagramRanking(records, 'top'),
    worstHexagrams: computeHexagramRanking(records, 'worst'),
    claimTypePerformance: computeClaimTypePerformance(records),
  }
}

function computeCategoryAccuracy(all: DivinationRecord[], fb: DivinationRecord[]): CategoryAccuracy[] {
  const cats: Category[] = ['工作', '人际', '财务', '健康', '其他']
  return cats.map(cat => {
    const catR = all.filter(r => r.category === cat)
    const catF = fb.filter(r => r.category === cat)
    const acc = catF.filter(r => r.feedback.status === 'accurate').length
    const inacc = catF.filter(r => r.feedback.status === 'inaccurate').length
    const unc = catF.filter(r => r.feedback.status === 'unclear').length
    const s = acc + inacc
    return {
      category: cat, totalDivinations: catR.length, feedbackCount: catF.length,
      accurateCount: acc, inaccurateCount: inacc, unclearCount: unc,
      accuracyRate: s > 0 ? acc / s : 0,
      feedbackResponseRate: catR.length > 0 ? catF.length / catR.length : 0,
      byClaimType: computeClaimTypePerformance(catR),
    }
  })
}

function computeHexagramRanking(records: DivinationRecord[], mode: 'top' | 'worst'): HexagramPerformance[] {
  const map = new Map<number, { total: number; accurate: number; inaccurate: number; trends: Trend[] }>()
  for (const r of records) {
    const hId = r.hexagram.original
    if (!map.has(hId)) map.set(hId, { total: 0, accurate: 0, inaccurate: 0, trends: [] })
    const e = map.get(hId)!
    e.total++
    if (r.feedback.status === 'accurate') e.accurate++
    if (r.feedback.status === 'inaccurate') e.inaccurate++
    for (const i of r.interpretations) e.trends.push(i.trend)
  }
  const list: HexagramPerformance[] = []
  for (const [hId, d] of map) {
    const h = lookupHexagram(hId)
    const s = d.accurate + d.inaccurate
    list.push({
      hexagramId: hId, name: h ? `${h.id}.${h.name}` : `#${hId}`,
      totalDivinations: d.total, accuracyRate: s > 0 ? d.accurate / s : 0,
      commonTrend: mostCommon(d.trends),
    })
  }
  list.sort((a, b) => mode === 'top' ? b.accuracyRate - a.accuracyRate : a.accuracyRate - b.accuracyRate)
  return list.slice(0, 5).filter(p => p.totalDivinations > 0)
}

function computeClaimTypePerformance(records: DivinationRecord[]): ClaimTypePerformance[] {
  const cnt = new Map<ClaimType, { h: number; m: number; u: number }>()
  const types: ClaimType[] = ['trend', 'condition', 'timeWindow', 'advice', 'answer']
  for (const t of types) cnt.set(t, { h: 0, m: 0, u: 0 })
  for (const r of records) {
    for (const interp of r.interpretations) {
      const fb = r.feedback.detail?.claimFeedback
      if (!fb) continue
      for (const claim of interp.claims) {
        const c = cnt.get(claim.type); if (!c) continue
        const cf = fb.find(f => f.claimId === claim.id)
        if (cf?.status === 'hit') c.h++
        else if (cf?.status === 'miss') c.m++
        else if (cf?.status === 'unclear') c.u++
      }
    }
  }
  return types.map(type => {
    const c = cnt.get(type)!
    const s = c.h + c.m
    return { type, hitCount: c.h, missCount: c.m, unclearCount: c.u, hitRate: s > 0 ? c.h / s : 0 }
  })
}

function mostCommon(items: Trend[]): Trend | null {
  if (!items.length) return null
  const counts: Record<string, number> = {}
  let best: Trend = '中性'; let max = 0
  for (const i of items) { counts[i] = (counts[i] || 0) + 1; if (counts[i] > max) { max = counts[i]; best = i } }
  return best
}

export function filterByCategory(report: AnalyticsReport, category: Category): CategoryAccuracy | null {
  return report.categoryAccuracy.find(c => c.category === category) ?? null
}
