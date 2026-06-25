import { describe, it, expect } from 'vitest'
import { divinationRecordSchema } from '../../src/lib/schemas.js'

const base = {
  schemaVersion: 1 as const, id: 't1', timestamp: '2026-06-25T00:00:00.000Z',
  question: '测试', category: '工作' as const, method: 'virtual' as const,
  hexagram: { original: 1, changed: null, changingLines: [], mutual: 2 },
  interpretations: [], feedback: { dueAt: null, status: 'pending' as const },
}

describe('divinationRecordSchema', () => {
  it('有效记录可解析', () => expect(divinationRecordSchema.safeParse(base).success).toBe(true))
  it('含 Phase1 新字段可解析', () => {
    const r = divinationRecordSchema.safeParse({
      ...base, hexagram: {
        ...base.hexagram, cuoGua: 2, zongGua: 1,
        tiYong: { tiElement: '金', yongElement: '金', relation: 'bihe', direction: 'ti-yong-bihe', interpretation: '比和' },
        timeContext: { yearPillar: '甲辰', monthZhi: '午', dayPillar: '丙寅', dayStem: '丙', dayZhi: '寅', season: '夏', monthWuxing: '火', wangElements: ['火', '土'] },
      },
    })
    expect(r.success).toBe(true)
  })
  it('向后兼容旧格式', () => expect(divinationRecordSchema.safeParse(base).success).toBe(true))
  it('无效数据拒绝', () => { expect(divinationRecordSchema.safeParse({}).success).toBe(false); expect(divinationRecordSchema.safeParse(null).success).toBe(false) })
  it('无效卦号拒绝', () => expect(divinationRecordSchema.safeParse({ ...base, hexagram: { ...base.hexagram, original: 99 } }).success).toBe(false))
  it('claims<5拒绝', () => expect(divinationRecordSchema.safeParse({ ...base, interpretations: [{ id: 'i1', type: 'default', trend: '利', analysis: 'a', conditions: [], timeWindow: 'tw', answer: 'ans', confidence: '高', model: 'm', promptVersion: '1', claims: [{ id: 'c1', type: 'trend', text: 't' }] }] }).success).toBe(false))
})
