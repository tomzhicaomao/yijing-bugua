import { describe, it, expect } from 'vitest'
import {
  castYarrowLine,
  castYarrowLineSimple,
  castSixYarrowLines,
  castSixYarrowLinesSimple,
} from '../../src/engine/yarrow-stalk.js'

describe('大衍筮法', () => {
  it('castYarrowLine returns valid line value', () => {
    const result = castYarrowLine()
    expect([6, 7, 8, 9]).toContain(result.lineValue)
    expect(result.finalBundles).toBeGreaterThan(0)
    expect(result.threeChanges).toHaveLength(3)
  })

  it('每一变的过程数据包含所有字段', () => {
    const result = castYarrowLine()
    for (const change of result.threeChanges) {
      expect(change.changeNumber).toBeGreaterThanOrEqual(1)
      expect(change.leftHandCount).toBeGreaterThan(0)
      expect(change.remainderTotal).toBeGreaterThan(0)
      expect(change.remaining).toBeGreaterThan(0)
    }
  })

  it('castYarrowLineSimple returns valid value', () => {
    const value = castYarrowLineSimple()
    expect([6, 7, 8, 9]).toContain(value)
  })

  it('castSixYarrowLines returns 6 details', () => {
    expect(castSixYarrowLines()).toHaveLength(6)
  })

  it('castSixYarrowLinesSimple returns 6 values', () => {
    const values = castSixYarrowLinesSimple()
    expect(values).toHaveLength(6)
    for (const v of values) {
      expect([6, 7, 8, 9]).toContain(v)
    }
  })

  it('蒙特卡洛 10万次验证概率分布', () => {
    const N = 100_000
    const counts = { 6: 0, 7: 0, 8: 0, 9: 0 }
    for (let i = 0; i < N; i++) {
      counts[castYarrowLineSimple()]++
    }
    expect(counts[6] / N).toBeCloseTo(0.0625, 1)
    expect(counts[7] / N).toBeCloseTo(0.3125, 1)
    expect(counts[8] / N).toBeCloseTo(0.4375, 1)
    expect(counts[9] / N).toBeCloseTo(0.1875, 1)
    expect(Math.abs(counts[6] / N - 0.0625)).toBeLessThan(0.005)
    expect(Math.abs(counts[7] / N - 0.3125)).toBeLessThan(0.005)
    expect(Math.abs(counts[8] / N - 0.4375)).toBeLessThan(0.005)
    expect(Math.abs(counts[9] / N - 0.1875)).toBeLessThan(0.005)
  })
})
