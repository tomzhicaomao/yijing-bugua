import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAIInterpretation } from '../../src/hooks/useAIInterpretation.js'
import type { DivinationRecord } from '../../src/types'

const rec: DivinationRecord = {
  schemaVersion: 1, id: 't1', timestamp: new Date().toISOString(),
  question: '测试', category: '工作', method: 'virtual',
  hexagram: { original: 1, changed: null, changingLines: [], mutual: 2 },
  interpretations: [], feedback: { dueAt: null, status: 'pending' },
}

const mockKey = vi.fn()
vi.mock('../../src/lib/api-key.js', () => ({ hasApiKey: () => mockKey() }))

const mockDouble = vi.fn()
vi.mock('../../src/ai/double-call.js', () => ({ runDoubleCall: (...a: unknown[]) => mockDouble(...a) }))
vi.mock('../../src/db/records.js', () => ({ updateRecord: () => Promise.resolve() }))
vi.mock('../../src/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' }, hasKey: true }) }))

describe('useAIInterpretation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('无 API Key → error', async () => {
    mockKey.mockReturnValue(false)
    const { result } = renderHook(() => useAIInterpretation())
    await result.current.triggerDefault(rec)
    await waitFor(() => { expect(result.current.error).toBe('未配置 API Key') })
  })

  it('成功调用返回 interpretation', async () => {
    mockKey.mockReturnValue(true)
    mockDouble.mockResolvedValue({
      success: true,
      interpretation: { id: 'i1', type: 'default', trend: '利', analysis: 'a', conditions: [], timeWindow: 'tw', answer: 'ans', confidence: '高', model: 'm', promptVersion: '1', claims: [] },
      narrative: 'n',
    })
    const { result } = renderHook(() => useAIInterpretation())
    const r = await result.current.triggerDefault(rec)
    expect(r?.interpretations).toHaveLength(1)
  })
})
