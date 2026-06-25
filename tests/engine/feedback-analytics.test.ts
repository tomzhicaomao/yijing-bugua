import { describe, it, expect } from 'vitest'
import { generateAnalyticsReport, filterByCategory } from '../../src/engine/feedback-analytics.js'
import type { DivinationRecord } from '../../src/types'

function rec(o: Partial<DivinationRecord> = {}): DivinationRecord {
  return {
    schemaVersion: 1, id: crypto.randomUUID(), timestamp: new Date().toISOString(),
    question: 't', category: '工作', method: 'virtual',
    hexagram: { original: 1, changed: null, changingLines: [] },
    interpretations: [], feedback: { dueAt: null, status: 'pending' }, ...o,
  }
}

describe('generateAnalyticsReport', () => {
  it('空记录零值', () => {
    const r = generateAnalyticsReport([]); expect(r.totalRecords).toBe(0); expect(r.overallAccuracy).toBe(0)
  })
  it('accurate→准确率1', () => {
    const r = generateAnalyticsReport([rec({ feedback: { dueAt: null, status: 'accurate' } })])
    expect(r.overallAccuracy).toBe(1)
  })
  it('1准+1不准→0.5', () => {
    const r = generateAnalyticsReport([
      rec({ feedback: { dueAt: null, status: 'accurate' } }),
      rec({ feedback: { dueAt: null, status: 'inaccurate' } }),
    ])
    expect(r.overallAccuracy).toBe(0.5)
  })
  it('pending不计入', () => {
    const r = generateAnalyticsReport([
      rec({ feedback: { dueAt: null, status: 'pending' } }),
      rec({ feedback: { dueAt: null, status: 'accurate' } }),
    ])
    expect(r.recordsWithFeedback).toBe(1)
  })
  it('按类别统计', () => {
    const r = generateAnalyticsReport([
      rec({ category: '工作', feedback: { dueAt: null, status: 'accurate' } }),
      rec({ category: '工作', feedback: { dueAt: null, status: 'inaccurate' } }),
      rec({ category: '健康', feedback: { dueAt: null, status: 'accurate' } }),
    ])
    expect(r.categoryAccuracy.find(c => c.category === '工作')?.accuracyRate).toBe(0.5)
    expect(r.categoryAccuracy.find(c => c.category === '健康')?.accuracyRate).toBe(1)
  })
  it('claim反馈统计', () => {
    const r = generateAnalyticsReport([rec({
      interpretations: [{ id: 'i1', type: 'default', trend: '利', analysis: 'a', conditions: [], timeWindow: 'tw', answer: 'ans', confidence: '高', model: 'm', promptVersion: '1', claims: [{ id: 'c1', type: 'trend', text: 't' }] }],
      feedback: { dueAt: null, status: 'accurate', detail: { claimFeedback: [{ claimId: 'c1', status: 'hit' }] } },
    })])
    expect(r.claimTypePerformance.find(c => c.type === 'trend')?.hitCount).toBe(1)
  })
  it('filterByCategory 返回对应类别', () => {
    const r = generateAnalyticsReport([rec({ category: '财务' })])
    expect(filterByCategory(r, '财务')?.category).toBe('财务')
    // 无记录的类别也返回（但 totalDivinations=0）
    expect(filterByCategory(r, '人际')?.totalDivinations).toBe(0)
  })
})
