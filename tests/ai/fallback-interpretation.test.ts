import { describe, it, expect } from 'vitest'
import { generateFallbackInterpretation } from '../../src/ai/fallback-interpretation.js'
import type { DivinationRecord } from '../../src/types'

const rec: DivinationRecord = {
  schemaVersion: 1, id: 't1', timestamp: new Date().toISOString(),
  question: '测试', category: '工作', method: 'virtual',
  hexagram: { original: 1, changed: null, changingLines: [], mutual: 2 },
  interpretations: [], feedback: { dueAt: null, status: 'pending' },
}

describe('generateFallbackInterpretation', () => {
  it('返回 summary+details', () => {
    const r = generateFallbackInterpretation(rec)
    expect(r.summary).toBeTruthy(); expect(r.details.length).toBeGreaterThan(0)
  })
  it('含本卦乾', () => expect(generateFallbackInterpretation(rec).summary).toContain('乾'))
  it('有变卦含姤', () => {
    const r = generateFallbackInterpretation({ ...rec, hexagram: { ...rec.hexagram, changed: 44, changingLines: [1] } })
    expect(r.summary).toContain('姤')
  })
  it('有动爻含动爻', () => {
    const r = generateFallbackInterpretation({ ...rec, hexagram: { ...rec.hexagram, changingLines: [1, 3] } })
    expect(r.details.some(d => d.includes('动爻'))).toBe(true)
  })
  it('无动爻提示以静制动', () => expect(generateFallbackInterpretation(rec).summary).toContain('无动爻'))
  it('无效卦不崩溃', () => {
    const r = generateFallbackInterpretation({ ...rec, hexagram: { ...rec.hexagram, original: 999 } })
    expect(r.summary).toBeTruthy()
  })
})
