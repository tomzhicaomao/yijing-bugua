import { describe, it, expect } from 'vitest'
import { buildUserProfile, buildPersonalizedContext } from '../../src/engine/user-profile.js'
import type { DivinationRecord } from '../../src/types'

const rec = (o: Partial<DivinationRecord> = {}): DivinationRecord => ({
  schemaVersion: 1, id: crypto.randomUUID(), timestamp: '2026-06-25T00:00:00.000Z',
  question: 't', category: '工作', method: 'virtual',
  hexagram: { original: 1, changed: null, changingLines: [] },
  interpretations: [], feedback: { dueAt: null, status: 'pending' }, ...o,
})

describe('buildUserProfile', () => {
  it('空记录零值', () => {
    const p = buildUserProfile('u1', []); expect(p.totalDivinations).toBe(0)
    expect(p.personalizedInsights).toEqual([])
  })
  it('记录统计', () => {
    const p = buildUserProfile('u1', [rec({ category: '工作' }), rec({ category: '工作' }), rec({ category: '财务' })])
    expect(p.totalDivinations).toBe(3)
    expect(p.preferredCategories[0].category).toBe('工作')
  })
  it('accurate 记录入 confirmedHexagrams', () => {
    const p = buildUserProfile('u1', [rec({ hexagram: { original: 3, changed: null, changingLines: [] }, feedback: { dueAt: null, status: 'accurate' } })])
    expect(p.confirmedHexagrams).toContain(3)
  })
  it('buildPersonalizedContext 空=空串', () => {
    expect(buildPersonalizedContext(buildUserProfile('u1', []), '工作')).toBe('')
  })
  it('buildPersonalizedContext 有内容', () => {
    const p = buildUserProfile('u1', [rec({ category: '工作', feedback: { dueAt: null, status: 'accurate' } })])
    expect(buildPersonalizedContext(p, '工作')).toContain('用户历史')
  })
})
