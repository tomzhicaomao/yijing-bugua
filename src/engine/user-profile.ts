/**
 * 用户个性化画像
 *
 * 从用户记录构建画像，用于个性化 prompt 上下文
 * 无反馈记录 → 空画像（不报错）
 */

import type { DivinationRecord, Category, ClaimType } from '../types'
import { lookupHexagram } from './hexagram-lookup.js'

export interface UserDivinationProfile {
  userId: string
  totalDivinations: number
  firstDivination: string
  lastDivination: string
  preferredCategories: Array<{ category: Category; count: number }>
  overallAccuracy: number
  categoryAccuracy: Partial<Record<Category, number>>
  confirmedHexagrams: number[]
  feedbackStyle: {
    responseRate: number
    claimHitRate: number
    mostActiveClaimType: ClaimType | null
  }
  personalizedInsights: string[]
}

export function buildUserProfile(userId: string, records: DivinationRecord[]): UserDivinationProfile {
  if (records.length === 0) return emptyProfile(userId)

  const timestamps = records.map(r => r.timestamp).sort()
  const catCounts = countByCategory(records)
  const accuracy = computeAccuracy(records)
  const confirmedHexagrams = [...new Set(records.filter(r => r.feedback.status === 'accurate').map(r => r.hexagram.original))]
  const fb = records.filter(r => r.feedback.status === 'accurate' || r.feedback.status === 'inaccurate')
  const ctStats = claimTypeStats(records)

  return {
    userId, totalDivinations: records.length,
    firstDivination: timestamps[0], lastDivination: timestamps[timestamps.length - 1],
    preferredCategories: catCounts.sort((a, b) => b.count - a.count),
    overallAccuracy: accuracy.overall, categoryAccuracy: accuracy.byCategory,
    confirmedHexagrams,
    feedbackStyle: {
      responseRate: records.length > 0 ? fb.length / records.length : 0,
      claimHitRate: accuracy.claimHitRate,
      mostActiveClaimType: mostActive(ctStats),
    },
    personalizedInsights: generateInsights(records, accuracy, catCounts),
  }
}

function emptyProfile(userId: string): UserDivinationProfile {
  return {
    userId, totalDivinations: 0, firstDivination: '', lastDivination: '',
    preferredCategories: [], overallAccuracy: 0, categoryAccuracy: {},
    confirmedHexagrams: [],
    feedbackStyle: { responseRate: 0, claimHitRate: 0, mostActiveClaimType: null },
    personalizedInsights: [],
  }
}

function countByCategory(records: DivinationRecord[]): Array<{ category: Category; count: number }> {
  const map = new Map<Category, number>()
  for (const r of records) map.set(r.category, (map.get(r.category) || 0) + 1)
  return Array.from(map.entries()).map(([c, n]) => ({ category: c, count: n }))
}

function computeAccuracy(records: DivinationRecord[]): { overall: number; byCategory: Partial<Record<Category, number>>; claimHitRate: number } {
  let ta = 0; let ti = 0
  const bc: Record<string, { a: number; i: number }> = {}
  let ch = 0; let ct = 0
  for (const r of records) {
    if (r.feedback.status === 'accurate') { ta++; (bc[r.category] ??= { a: 0, i: 0 }).a++ }
    if (r.feedback.status === 'inaccurate') { ti++; (bc[r.category] ??= { a: 0, i: 0 }).i++ }
    for (const interp of r.interpretations) {
      const fb = r.feedback.detail?.claimFeedback; if (!fb) continue
      for (const claim of interp.claims) {
        const cf = fb.find(f => f.claimId === claim.id); if (!cf) continue
        ct++; if (cf.status === 'hit') ch++
      }
    }
  }
  const s = ta + ti
  const byCategory: Partial<Record<Category, number>> = {}
  for (const [cat, d] of Object.entries(bc)) { const ss = d.a + d.i; byCategory[cat as Category] = ss > 0 ? d.a / ss : 0 }
  return { overall: s > 0 ? ta / s : 0, byCategory, claimHitRate: ct > 0 ? ch / ct : 0 }
}

function claimTypeStats(records: DivinationRecord[]): Map<ClaimType, number> {
  const m = new Map<ClaimType, number>()
  for (const r of records) for (const interp of r.interpretations) for (const c of interp.claims) m.set(c.type, (m.get(c.type) || 0) + 1)
  return m
}

function mostActive(stats: Map<ClaimType, number>): ClaimType | null {
  let best: ClaimType | null = null; let max = 0
  for (const [t, n] of stats) if (n > max) { max = n; best = t }
  return best
}

function generateInsights(records: DivinationRecord[], accuracy: ReturnType<typeof computeAccuracy>, catCounts: Array<{ category: Category; count: number }>): string[] {
  const ins: string[] = []
  if (catCounts.length > 0) ins.push(`你最常问${catCounts[0].category}类问题（${catCounts[0].count}次）`)
  for (const [cat, rate] of Object.entries(accuracy.byCategory)) {
    if (rate >= 0.8) ins.push(`${cat}类准确率较高（${Math.round(rate * 100)}%）`)
    else if (rate <= 0.3 && rate > 0) ins.push(`${cat}类准确率偏低（${Math.round(rate * 100)}%）`)
  }
  const hexCount = new Map<number, number>()
  for (const r of records) hexCount.set(r.hexagram.original, (hexCount.get(r.hexagram.original) || 0) + 1)
  const top = [...hexCount.entries()].sort((a, b) => b[1] - a[1])[0]
  if (top && top[1] >= 2) { const h = lookupHexagram(top[0]); if (h) ins.push(`多次得${h.name}卦（${top[1]}次）`) }
  return ins
}

export function buildPersonalizedContext(profile: UserDivinationProfile, currentCategory: Category): string {
  if (profile.totalDivinations === 0) return ''
  const parts: string[] = ['【用户历史】', `- 已占卜 ${profile.totalDivinations} 次`]
  const ca = profile.categoryAccuracy[currentCategory]
  if (ca !== undefined) parts.push(`- ${currentCategory}类准确率 ${Math.round(ca * 100)}%`)
  const t = profile.preferredCategories[0]
  if (t && t.category !== currentCategory) parts.push(`- 最常问${t.category}类（${t.count}次）`)
  if (profile.feedbackStyle.mostActiveClaimType) {
    const names: Record<ClaimType, string> = { trend: '趋势判断', condition: '条件判断', timeWindow: '时间窗口', advice: '行动建议', answer: '结论' }
    parts.push(`- 对${names[profile.feedbackStyle.mostActiveClaimType]}反馈最活跃`)
  }
  return parts.join('\n')
}
