import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { DivinationRecord } from '../../src/types'

// Persistent query builder — rebuilt in beforeEach, not via clearAllMocks
let qb: Record<string, any> = {}

function resetQb() {
  qb = {
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => qb),
    update: vi.fn(() => qb),
    delete: vi.fn(() => qb),
    eq: vi.fn(() => qb),
    not: vi.fn(() => qb),
    order: vi.fn(() => qb),
    lte: vi.fn(() => qb),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
    // These are destructured from `await chainResult` where chainResult = qb
    data: [] as any,
    error: null,
  }
}

resetQb()

const mockFrom = vi.fn(() => qb)

vi.mock('../../src/lib/supabase', () => ({
  supabaseReady: true,
  supabase: {
    from: mockFrom,
  },
}))

const {
  createRecord,
  updateRecord,
  getRecordById,
  getAllRecords,
  queryByCategory,
  queryPendingDue,
  queryByFeedbackStatus,
  deleteRecord,
  clearAll,
} = await import('../../src/db/records.js')

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
  }
}

describe('records CRUD (mocked Supabase)', () => {
  const userId = 'test-user-id'

  beforeEach(() => {
    resetQb()
    mockFrom.mockClear()
  })

  it('createRecord calls supabase.from("records").insert', async () => {
    const record = makeTestRecord()
    qb.insert.mockResolvedValue({ error: null })

    await createRecord(record, userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.insert).toHaveBeenCalledTimes(1)
    const insertArg = qb.insert.mock.calls[0][0]
    expect(insertArg).toMatchObject({
      id: record.id,
      question: record.question,
      user_id: userId,
    })
  })

  it('createRecord throws on error', async () => {
    qb.insert.mockResolvedValue({ error: new Error('DB error') })

    await expect(createRecord(makeTestRecord(), userId)).rejects.toThrow('Failed to create record')
  })

  it('updateRecord calls update with correct chain', async () => {
    const record = makeTestRecord()
    qb.error = null

    await updateRecord(record, userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.update).toHaveBeenCalled()
    expect(qb.eq).toHaveBeenCalledWith('id', record.id)
    expect(qb.eq).toHaveBeenCalledWith('user_id', userId)
  })

  it('updateRecord throws on error', async () => {
    qb.error = new Error('Update failed')

    await expect(updateRecord(makeTestRecord(), userId)).rejects.toThrow('Failed to update record')
  })

  it('getRecordById returns null when PGRST116', async () => {
    qb.single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } })

    const result = await getRecordById('nonexistent', userId)

    expect(result).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.eq).toHaveBeenCalledWith('id', 'nonexistent')
    expect(qb.eq).toHaveBeenCalledWith('user_id', userId)
  })

  it('getRecordById returns a record', async () => {
    const record = makeTestRecord()
    qb.single.mockResolvedValue({
      data: {
        id: record.id,
        schema_version: 1,
        timestamp: record.timestamp,
        question: record.question,
        category: record.category,
        method: record.method,
        hexagram: record.hexagram,
        interpretations: record.interpretations,
        feedback: record.feedback,
      },
      error: null,
    })

    const result = await getRecordById(record.id, userId)

    expect(result).not.toBeNull()
    expect(result!.id).toBe(record.id)
  })

  it('getAllRecords returns records sorted by timestamp desc', async () => {
    const rows = [
      { id: 'r2', schema_version: 1, timestamp: '2026-06-01T00:00:00.000Z', question: 'second', category: '工作', method: 'virtual' as const, hexagram: { original: 1, changed: null, changingLines: [] }, interpretations: [] },
      { id: 'r1', schema_version: 1, timestamp: '2026-01-01T00:00:00.000Z', question: 'first', category: '工作', method: 'virtual' as const, hexagram: { original: 1, changed: null, changingLines: [] }, interpretations: [] },
    ]
    qb.data = rows
    qb.error = null

    const all = await getAllRecords(userId)

    expect(all).toHaveLength(2)
    expect(all[0].id).toBe('r2')
    expect(all[1].id).toBe('r1')
    expect(qb.order).toHaveBeenCalledWith('timestamp', { ascending: false })
  })

  it('getAllRecords returns empty array on null data', async () => {
    qb.data = null
    qb.error = null

    const all = await getAllRecords(userId)
    expect(all).toEqual([])
  })

  it('queryByCategory filters by category', async () => {
    qb.data = []
    qb.error = null

    await queryByCategory('工作', userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.eq).toHaveBeenCalledWith('category', '工作')
  })

  it('queryPendingDue queries pending feedback with dueAt constraint', async () => {
    qb.data = []
    qb.error = null

    await queryPendingDue(userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.eq).toHaveBeenCalledWith('feedback->>status', 'pending')
    expect(qb.not).toHaveBeenCalledWith('feedback', 'is', null)
    expect(qb.lte).toHaveBeenCalled()
    expect(qb.order).toHaveBeenCalledWith('timestamp', { ascending: false })
  })

  it('queryByFeedbackStatus filters by feedback status', async () => {
    qb.data = []
    qb.error = null

    await queryByFeedbackStatus('accurate', userId)

    expect(qb.eq).toHaveBeenCalledWith('feedback->>status', 'accurate')
  })

  it('deleteRecord calls delete with correct chain', async () => {
    qb.error = null

    await deleteRecord('record-1', userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.delete).toHaveBeenCalled()
    expect(qb.eq).toHaveBeenCalledWith('id', 'record-1')
    expect(qb.eq).toHaveBeenCalledWith('user_id', userId)
  })

  it('clearAll deletes all user records', async () => {
    qb.error = null

    await clearAll(userId)

    expect(mockFrom).toHaveBeenCalledWith('records')
    expect(qb.eq).toHaveBeenCalledWith('user_id', userId)
  })
})
