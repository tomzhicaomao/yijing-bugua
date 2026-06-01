import { describe, it, expect } from 'vitest'
import {
  isDuplicateQuestion,
  checkDuplicate,
} from '../../src/engine/duplicate-check.js'
import type { DivinationRecord } from '../../src/types'

function makeRecord(overrides: Partial<DivinationRecord>): DivinationRecord {
  return {
    schemaVersion: 1,
    id: 'test-1',
    timestamp: new Date().toISOString(),
    question: '测试问题',
    category: '工作',
    method: 'virtual',
    hexagram: { original: 1, changed: null, changingLines: [] },
    interpretations: [],
    feedback: { dueAt: null, status: 'pending' },
    ...overrides,
  }
}

// ===== 3.10 Duplicate check tests =====
describe('isDuplicateQuestion', () => {
  it('detects identical question within 24h', () => {
    const question = '跟老板谈加薪能成吗'
    const records = [
      makeRecord({
        id: 'existing-1',
        question: '跟老板谈加薪能成吗',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      }),
    ]
    expect(isDuplicateQuestion(question, records, 24)).toBe(true)
  })

  it('returns false for different question', () => {
    const records = [
      makeRecord({
        id: 'existing-1',
        question: '换工作好不好',
        timestamp: new Date().toISOString(),
      }),
    ]
    expect(isDuplicateQuestion('跟老板谈加薪', records, 24)).toBe(false)
  })

  it('returns false for question older than window', () => {
    const question = '跟老板谈加薪能成吗'
    const records = [
      makeRecord({
        id: 'existing-1',
        question: '跟老板谈加薪能成吗',
        timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), // 48 hours ago
      }),
    ]
    expect(isDuplicateQuestion(question, records, 24)).toBe(false)
  })
})

describe('checkDuplicate', () => {
  it('returns null when no duplicates found', () => {
    const result = checkDuplicate('新问题', [], 24)
    expect(result).toBeNull()
  })

  it('returns duplicate info when duplicate exists', () => {
    const records = [
      makeRecord({
        id: 'existing-1',
        question: '一样的问题',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      }),
    ]
    const result = checkDuplicate('一样的问题', records, 24)
    expect(result).not.toBeNull()
    expect(result!.countWithin24h).toBe(1)
    expect(result!.relatedRecordIds).toContain('existing-1')
  })

  it('counts multiple duplicates within window', () => {
    const records = [
      makeRecord({
        id: 'r1',
        question: '一样的问题',
        timestamp: new Date(Date.now() - 2000000).toISOString(),
      }),
      makeRecord({
        id: 'r2',
        question: '一样的问题',
        timestamp: new Date(Date.now() - 4000000).toISOString(),
      }),
    ]
    const result = checkDuplicate('一样的问题', records, 24)
    expect(result!.countWithin24h).toBe(2)
    expect(result!.relatedRecordIds).toEqual(['r1', 'r2'])
  })
})
