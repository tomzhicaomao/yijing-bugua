import { describe, it, expect, vi, beforeEach } from 'vitest'

// Persistent query builder — rebuilt in beforeEach
let qb: Record<string, any> = {}

function resetQb() {
  qb = {
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => qb),
    update: vi.fn(() => qb),
    delete: vi.fn(() => qb),
    eq: vi.fn(() => qb),
    order: vi.fn(() => qb),
    lte: vi.fn(() => qb),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
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

const { exportToJSON, exportFilename, importFromJSON } = await import('../../src/db/export-import.js')

describe('exportToJSON', () => {
  const userId = 'test-user-id'

  beforeEach(() => {
    resetQb()
    mockFrom.mockClear()
  })

  it('returns valid JSON string with records', async () => {
    const rows = [
      { id: 'exp-1', schema_version: 1, timestamp: new Date().toISOString(), question: '测试问题', category: '工作', method: 'virtual', hexagram: { original: 1, changed: null, changingLines: [] }, interpretations: [], feedback: { dueAt: null, status: 'pending' } },
    ]
    qb.data = rows
    qb.error = null

    const json = await exportToJSON(userId)
    const parsed = JSON.parse(json)

    expect(parsed.app).toBe('yijing-bugua')
    expect(parsed.schemaVersion).toBe(1)
    expect(parsed.exportedAt).toBeTruthy()
    expect(parsed.records).toHaveLength(1)
    expect(parsed.records[0].id).toBe('exp-1')
  })

  it('exportFilename contains yijing-export date format', () => {
    const name = exportFilename()
    expect(name).toMatch(/^yijing-export-\d{4}-\d{2}-\d{2}\.json$/)
  })

  it('exports empty array when no records', async () => {
    qb.data = []
    qb.error = null

    const json = await exportToJSON(userId)
    const parsed = JSON.parse(json)
    expect(parsed.records).toHaveLength(0)
  })
})

describe('importFromJSON', () => {
  const userId = 'test-user-id'

  beforeEach(() => {
    resetQb()
    mockFrom.mockClear()
  })

  it('imports valid records', async () => {
    // getRecordById will call .single() — return "not found"
    qb.single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
    // createRecord will call .insert()
    qb.insert.mockResolvedValue({ error: null })

    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [{
        schemaVersion: 1,
        id: 'imp-1',
        timestamp: new Date().toISOString(),
        question: '测试问题',
        category: '工作',
        method: 'virtual',
        hexagram: { original: 1, changed: null, changingLines: [] },
        interpretations: [],
        feedback: { dueAt: null, status: 'pending' },
      }],
    })

    const result = await importFromJSON(json, userId)

    expect(result.added).toBe(1)
    expect(result.errors).toHaveLength(0)
    expect(qb.insert).toHaveBeenCalledTimes(1)
  })

  it('skips duplicate ids', async () => {
    // getRecordById finds existing record
    qb.single.mockResolvedValue({ data: { id: 'existing' }, error: null })

    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [{
        schemaVersion: 1,
        id: 'existing',
        timestamp: new Date().toISOString(),
        question: '测试问题',
        category: '工作',
        method: 'virtual',
        hexagram: { original: 1, changed: null, changingLines: [] },
        interpretations: [],
        feedback: { dueAt: null, status: 'pending' },
      }],
    })

    const result = await importFromJSON(json, userId)

    expect(result.skipped).toBe(1)
    expect(result.added).toBe(0)
  })

  it('rejects invalid JSON', async () => {
    const result = await importFromJSON('not json', userId)
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

    const result = await importFromJSON(json, userId)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('数据版本过新')
  })

  it('skips invalid records but imports valid ones', async () => {
    qb.single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } })
    qb.insert.mockResolvedValue({ error: null })

    const json = JSON.stringify({
      app: 'yijing-bugua',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      records: [
        {
          schemaVersion: 1,
          id: 'valid-1',
          timestamp: new Date().toISOString(),
          question: 'good',
          category: '工作',
          method: 'virtual',
          hexagram: { original: 1, changed: null, changingLines: [] },
          interpretations: [],
          feedback: { dueAt: null, status: 'pending' },
        },
        {
          schemaVersion: 1,
          id: 'invalid-1',
          timestamp: new Date().toISOString(),
          question: 'bad',
          category: '工作',
          method: 'virtual',
          hexagram: { original: 999, changed: null, changingLines: [] },
          interpretations: [],
          feedback: { dueAt: null, status: 'pending' },
        },
      ],
    })

    const result = await importFromJSON(json, userId)

    expect(result.added).toBe(1)
    expect(result.invalid).toBe(1)
  })
})
