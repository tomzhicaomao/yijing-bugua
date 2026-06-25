import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDivination } from '../../src/hooks/useDivination.js'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }))

const mockCreateRecord = vi.fn()
const mockGetAllRecords = vi.fn().mockResolvedValue([])
vi.mock('../../src/db/records.js', () => ({
  createRecord: (...args: unknown[]) => mockCreateRecord(...args),
  getAllRecords: (...args: unknown[]) => mockGetAllRecords(...args),
}))
vi.mock('../../src/engine/duplicate-check.js', () => ({ checkDuplicate: () => null }))
vi.mock('../../src/engine/casting.js', () => ({
  tossResultToLineValue: (n: number) => ({ 0: 6, 1: 7, 2: 8, 3: 9 } as Record<number, number>)[n] ?? 7,
  calculateHexagram: () => ({
    original: 1, changed: null, changingLines: [], mutual: 2,
    cuoGua: 2, zongGua: 1,
    tiYong: { tiElement: '金', yongElement: '金', relation: 'bihe', direction: 'ti-yong-bihe', interpretation: '比和' },
    timeContext: { yearPillar: '甲辰', monthZhi: '午', dayPillar: '丙寅', dayStem: '丙', dayZhi: '寅', season: '夏', monthWuxing: '火', wangElements: ['火', '土'] },
  }),
}))
vi.mock('../../src/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'test-user' } }) }))
vi.mock('../../src/lib/feedback-due.js', () => ({ calculateDefaultDueAt: () => new Date(Date.now() + 86400000).toISOString() }))
vi.mock('uuid', () => ({ v4: () => 'mock-uuid-123' }))

describe('useDivination', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('初始状态为 question', () => {
    const { result } = renderHook(() => useDivination())
    expect(result.current.step).toBe('question')
    expect(result.current.currentIndex).toBe(0)
  })

  it('setQuestionAndCategory → step=before-divination', () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.setQuestionAndCategory('测试', '工作'))
    expect(result.current.step).toBe('before-divination')
    expect(result.current.question).toBe('测试')
  })

  it('setBeforeAndContinue → step=method', () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.setBeforeAndContinue({}))
    expect(result.current.step).toBe('method')
  })

  it('startCasting → lines 重置', () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.startCasting('virtual'))
    expect(result.current.step).toBe('casting')
    expect(result.current.lines).toEqual([null, null, null, null, null, null])
  })

  it('逐爻设置 currentIndex 递增', () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.startCasting('virtual'))
    act(() => result.current.setLineValue(7))
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.lines[0]).toBe(7)
    act(() => result.current.setLineValue(8))
    expect(result.current.currentIndex).toBe(2)
    expect(result.current.lines[1]).toBe(8)
  })

  it('completeCasting → navigate + 新字段', async () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.setQuestionAndCategory('测试', '工作'))
    act(() => result.current.startCasting('virtual'))
    // 手动设置6爻
    for (const v of [7, 8, 7, 8, 7, 8]) {
      act(() => result.current.setLineValue(v as 7 | 8))
    }
    // 直接调用 completeCasting 避免 queueMicrotask 时序问题
    await act(async () => { await result.current.completeCasting() })
    expect(mockNavigate).toHaveBeenCalledWith('/result/mock-uuid-123')
    expect(mockCreateRecord).toHaveBeenCalledTimes(1)
    expect(mockCreateRecord.mock.calls[0][0].hexagram.cuoGua).toBe(2)
    expect(mockCreateRecord.mock.calls[0][0].hexagram.tiYong).toBeDefined()
  })

  it('selectManualBack 正确映射', () => {
    const { result } = renderHook(() => useDivination())
    act(() => result.current.startCasting('manual'))
    act(() => result.current.selectManualBack(3))
    expect(result.current.lines[0]).toBe(9)
  })
})
