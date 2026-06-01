import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  initDB,
  createRecord,
  clearAll,
} from '../../src/db/records.js'
import {
  exportToJSON,
  exportFilename,
  importFromJSON,
} from '../../src/db/export-import.js'
import type { DivinationRecord } from '../../src/types'

function makeTestRecord(overrides: Partial<DivinationRecord> = {}): DivinationRecord {
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
  } as DivinationRecord
}

describe('JSON export', () => {
  beforeAll(async () => {
    await initDB()
  })

  beforeEach(async () => {
    await clearAll()
  })

  it('exports valid JSON with correct top-level structure', async () => {
    await createRecord(makeTestRecord({ id: 'exp-1' }))
    const json = await exportToJSON()
    const parsed = JSON.parse(json)

    expect(parsed.app).toBe('yijing-bugua')
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.exportedAt).toBeTruthy()
    expect(parsed.records).toHaveLength(1)
  })

  it('exportFilename contains yijing-export date format', () => {
    const name = exportFilename()
    expect(name).toMatch(/^yijing-export-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('exports empty array when no records', async () => {
    const json = await exportToJSON()
    const parsed = JSON.parse(json)
    expect(parsed.records).toHaveLength(0)
  })
})

describe('JSON import', () => {
  beforeAll(async () => {
    await initDB()
  })

  beforeEach(async () => {
    await clearAll()
  })

  it('imports valid records', async () => {
    const record = makeTestRecord({ id: 'imp-1' })
    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [record],
    })

    const result = await importFromJSON(json)
    expect(result.added).toBe(1)
    expect(result.errors).toHaveLength(0)
  })

  it('skips duplicate ids', async () => {
    await createRecord(makeTestRecord({ id: 'existing' }))
    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [makeTestRecord({ id: 'existing' })],
    })

    const result = await importFromJSON(json)
    expect(result.skipped).toBe(1)
    expect(result.added).toBe(0)
  })

  it('rejects invalid JSON', async () => {
    const result = await importFromJSON('not json')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('JSON 格式无效')
  })

  it('rejects future schemaVersion', async () => {
    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 99,
      exportedAt: new Date().toISOString(),
      records: [],
    })

    const result = await importFromJSON(json)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('数据版本过新')
  })

  it('skips invalid records but imports valid ones', async () => {
    const valid = makeTestRecord({ id: 'valid-1' })
    const invalid = { ...makeTestRecord({ id: 'invalid-1' }), hexagram: { original: 999 } }
    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [valid, invalid],
    })

    const result = await importFromJSON(json)
    expect(result.added).toBe(1)
    expect(result.invalid).toBe(1)
  })
})
