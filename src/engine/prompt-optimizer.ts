/**
 * Prompt 迭代优化系统
 *
 * 版本管理/指标对比/版本切换 — 非全自动，最终调整由人工决策
 */

import type { ClaimType, Category } from '../types'

export interface PromptMetrics {
  totalCalls: number
  averageAccuracy: number
  byClaimType: Record<ClaimType, number>
  byCategory: Record<Category, number>
}

export interface PromptVersion {
  version: string
  releasedAt: string
  changelog: string
  systemPrompt: string
  userPromptTemplate: string
  metrics?: PromptMetrics
}

export interface VersionComparison {
  v1: string; v2: string
  accuracyDelta: number
  bestForClaimTypes: ClaimType[]
  bestForCategories: Category[]
}

let versions: PromptVersion[] = []
let activeIdx = 0

export function registerPromptVersion(v: PromptVersion): void { versions.push(v); activeIdx = versions.length - 1 }
export function getActivePromptVersion(): PromptVersion | null { return versions[activeIdx] ?? null }
export function getPromptVersion(version: string): PromptVersion | null { return versions.find(v => v.version === version) ?? null }

export function setActiveVersion(version: string): boolean {
  const i = versions.findIndex(v => v.version === version)
  if (i === -1) return false; activeIdx = i; return true
}

export function updateVersionMetrics(version: string, metrics: PromptMetrics): boolean {
  const v = versions.find(v => v.version === version); if (!v) return false; v.metrics = metrics; return true
}

export function compareVersions(v1: string, v2: string): VersionComparison | null {
  const a = versions.find(v => v.version === v1); const b = versions.find(v => v.version === v2)
  if (!a || !b || !a.metrics || !b.metrics) return null
  const types: ClaimType[] = ['trend', 'condition', 'timeWindow', 'advice', 'answer']
  const cats: Category[] = ['工作', '人际', '财务', '健康', '其他']
  return {
    v1, v2, accuracyDelta: b.metrics.averageAccuracy - a.metrics.averageAccuracy,
    bestForClaimTypes: types.filter(t => (b.metrics!.byClaimType[t] || 0) > (a.metrics!.byClaimType[t] || 0)),
    bestForCategories: cats.filter(c => (b.metrics!.byCategory[c] || 0) > (a.metrics!.byCategory[c] || 0)),
  }
}

export function listVersions(): PromptVersion[] { return [...versions] }
export function resetVersions(): void { versions = []; activeIdx = 0 }
