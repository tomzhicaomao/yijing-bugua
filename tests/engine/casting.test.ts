import { describe, it, expect } from 'vitest'
import {
  tossResultToLineValue,
  castLine,
  calculateHexagram,
} from '../../src/engine/casting.js'
import type { LineValue } from '../../src/types'

// ===== 3.1 Coin probability tests =====
describe('tossResultToLineValue', () => {
  it('maps back count 0 → 6 (老阴)', () => {
    expect(tossResultToLineValue(0)).toBe(6)
  })
  it('maps back count 1 → 7 (少阳)', () => {
    expect(tossResultToLineValue(1)).toBe(7)
  })
  it('maps back count 2 → 8 (少阴)', () => {
    expect(tossResultToLineValue(2)).toBe(8)
  })
  it('maps back count 3 → 9 (老阳)', () => {
    expect(tossResultToLineValue(3)).toBe(9)
  })
  it('throws on invalid back count', () => {
    expect(() => tossResultToLineValue(-1 as any)).toThrow()
    expect(() => tossResultToLineValue(4 as any)).toThrow()
  })
})

describe('castLine probability distribution', () => {
  it('produces 6=1/8, 7=3/8, 8=3/8, 9=1/8 (within tolerance)', () => {
    const counts = { 6: 0, 7: 0, 8: 0, 9: 0 }
    const N = 8000
    for (let i = 0; i < N; i++) {
      const v = castLine()
      counts[v]++
    }
    // 6 and 9 each ≈ 12.5% (±5%)
    expect(counts[6] / N).toBeGreaterThan(0.07)
    expect(counts[6] / N).toBeLessThan(0.18)
    expect(counts[9] / N).toBeGreaterThan(0.07)
    expect(counts[9] / N).toBeLessThan(0.18)
    // 7 and 8 each ≈ 37.5% (±5%)
    expect(counts[7] / N).toBeGreaterThan(0.32)
    expect(counts[7] / N).toBeLessThan(0.43)
    expect(counts[8] / N).toBeGreaterThan(0.32)
    expect(counts[8] / N).toBeLessThan(0.43)
  })
})

// ===== 3.3 Hexagram calculation tests =====
describe('calculateHexagram', () => {
  it('all 7 (少阳) → 乾为天 #1, no changing lines', () => {
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [7, 7, 7, 7, 7, 7]
    const result = calculateHexagram(lines)
    expect(result.original).toBe(1)
    expect(result.changed).toBeNull()
    expect(result.changingLines).toEqual([])
  })

  it('all 8 (少阴) → 坤为地 #2, no changing lines', () => {
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [8, 8, 8, 8, 8, 8]
    const result = calculateHexagram(lines)
    expect(result.original).toBe(2)
    expect(result.changed).toBeNull()
    expect(result.changingLines).toEqual([])
  })

  it('mixed values compute correct hexagram', () => {
    // 泰卦: 下乾上坤 → 初阳二阳三阳四阴五阴上阴 → [7,7,7,8,8,8] → 地天泰 #11
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [7, 7, 7, 8, 8, 8]
    const result = calculateHexagram(lines)
    expect(result.original).toBe(11) // 地天泰
  })

  it('老阴(6) and 老阳(9) create changing lines and changed hexagram', () => {
    // [7,8,9,6,7,8]
    // Original: 阳阴阳明阴阳 → binary(010101) = 63 既济
    // Changed:  阳阴阴阳阳阴 → binary(011001) = 17 随
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [7, 8, 9, 6, 7, 8]
    const result = calculateHexagram(lines)
    expect(result.original).toBe(63)  // 水火既济
    expect(result.changed).toBe(17)   // 泽雷随
    expect(result.changingLines).toEqual([3, 4])
  })

  it('no changing lines returns null changed hexagram', () => {
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [7, 8, 7, 8, 7, 8]
    const result = calculateHexagram(lines)
    expect(result.changed).toBeNull()
    expect(result.changingLines).toEqual([])
  })

  it('six moving lines (all 6) changes every line', () => {
    const lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] =
      [6, 6, 6, 6, 6, 6]
    const result = calculateHexagram(lines)
    expect(result.original).toBe(2)   // 坤为地
    expect(result.changed).toBe(1)    // 乾为天
    expect(result.changingLines).toEqual([1, 2, 3, 4, 5, 6])
  })
})
