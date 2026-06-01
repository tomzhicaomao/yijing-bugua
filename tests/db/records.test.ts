import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  initDB,
  createRecord,
  updateRecord,
  getRecordById,
  getAllRecords,
  queryByCategory,
  queryPendingDue,
} from '../../src/db/records.js'
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

describe('IndexedDB records CRUD', () => {
  beforeAll(async () => {
    await initDB()
  })

  beforeEach(async () => {
    // Clean up all records before each test
    const all = await getAllRecords()
    for (const r of all) {
      // We'll need a delete function or clear the store
    }
  })

  it('createRecord writes a record to IndexedDB', async () => {
    const record = makeTestRecord()
    await createRecord(record)
    const fetched = await getRecordById(record.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.question).toBe('测试问题')
  })

  it('getRecordById returns null for non-existent id', async () => {
    const result = await getRecordById('nonexistent')
    expect(result).toBeNull()
  })

  it('updateRecord updates an existing record', async () => {
    const record = makeTestRecord()
    await createRecord(record)

    const updated = { ...record, question: '更新后的问题' }
    await updateRecord(updated)

    const fetched = await getRecordById(record.id)
    expect(fetched!.question).toBe('更新后的问题')
  })

  it('getAllRecords returns records sorted by timestamp desc', async () => {
    const r1 = makeTestRecord({ id: 'r1', timestamp: '2026-01-01T00:00:00.000Z' })
    const r2 = makeTestRecord({ id: 'r2', timestamp: '2026-06-01T00:00:00.000Z' })
    await createRecord(r1)
    await createRecord(r2)

    const all = await getAllRecords()
    expect(all.length).toBeGreaterThanOrEqual(2)
    // r2 is newer, should be first
    const index1 = all.findIndex((r) => r.id === 'r1')
    const index2 = all.findIndex((r) => r.id === 'r2')
    expect(index2).toBeLessThan(index1)
  })

  it('queryByCategory filters by category', async () => {
    await createRecord(makeTestRecord({ id: 'wc1', category: '工作' }))
    await createRecord(makeTestRecord({ id: 'rc1', category: '人际' }))

    const work = await queryByCategory('工作')
    expect(work.every((r) => r.category === '工作')).toBe(true)
  })

  it('queryPendingDue returns pending records with dueAt <= now', async () => {
    const past = new Date(Date.now() - 86400000).toISOString() // 1 day ago
    const future = new Date(Date.now() + 86400000).toISOString() // 1 day ahead

    await createRecord(makeTestRecord({
      id: 'pending-past',
      feedback: { dueAt: past, status: 'pending' },
    }))
    await createRecord(makeTestRecord({
      id: 'pending-future',
      feedback: { dueAt: future, status: 'pending' },
    }))
    await createRecord(makeTestRecord({
      id: 'done',
      feedback: { dueAt: past, status: 'accurate' },
    }))

    const pending = await queryPendingDue()
    expect(pending.length).toBe(1)
    expect(pending[0].id).toBe('pending-past')
  })
})
