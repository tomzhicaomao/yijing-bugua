import { describe, it, expect } from 'vitest'
import {
  calculateCuoGua,
  calculateZongGua,
  SELF_ZONG_GUA,
  buildCuoGuaMap,
  buildZongGuaMap,
} from '../../src/engine/hexagram-transforms.js'
import type { HexagramLines } from '../../src/types'

describe('错卦 CuoGua', () => {
  it('乾(1) → 坤(2)', () => {
    const lines: HexagramLines = [7, 7, 7, 7, 7, 7]
    expect(calculateCuoGua(lines)).toBe(2)
  })

  it('坤(2) → 乾(1)', () => {
    const lines: HexagramLines = [8, 8, 8, 8, 8, 8]
    expect(calculateCuoGua(lines)).toBe(1)
  })

  it('泰(11) → 否(12)', () => {
    const lines: HexagramLines = [7, 7, 7, 8, 8, 8]
    expect(calculateCuoGua(lines)).toBe(12)
  })

  it('既济(63) → 未济(64)', () => {
    const lines: HexagramLines = [9, 8, 9, 8, 9, 8]
    expect(calculateCuoGua(lines)).toBe(64)
  })
})

describe('综卦 ZongGua', () => {
  it('乾(1) 自综', () => {
    const lines: HexagramLines = [7, 7, 7, 7, 7, 7]
    expect(calculateZongGua(lines)).toBe(1)
  })

  it('坤(2) 自综', () => {
    const lines: HexagramLines = [8, 8, 8, 8, 8, 8]
    expect(calculateZongGua(lines)).toBe(2)
  })

  it('屯(3) → 蒙(4)', () => {
    const lines: HexagramLines = [7, 8, 8, 8, 7, 8]
    expect(calculateZongGua(lines)).toBe(4)
  })
})

describe('8个自综卦', () => {
  it('SELF_ZONG_GUA set contains correct IDs', () => {
    expect(SELF_ZONG_GUA.has(1)).toBe(true)
    expect(SELF_ZONG_GUA.has(2)).toBe(true)
    expect(SELF_ZONG_GUA.has(29)).toBe(true)
    expect(SELF_ZONG_GUA.has(30)).toBe(true)
    expect(SELF_ZONG_GUA.has(28)).toBe(true)
    expect(SELF_ZONG_GUA.has(62)).toBe(true)
    expect(SELF_ZONG_GUA.has(27)).toBe(true)
    expect(SELF_ZONG_GUA.has(61)).toBe(true)
    expect(SELF_ZONG_GUA.has(3)).toBe(false)
    expect(SELF_ZONG_GUA.size).toBe(8)
  })
})

describe('预计算表', () => {
  it('buildCuoGuaMap covers all 64 hexagrams', () => {
    const map = buildCuoGuaMap()
    expect(Object.keys(map)).toHaveLength(64)
    expect(map[1]).toBe(2)
    expect(map[2]).toBe(1)
  })

  it('buildZongGuaMap covers all 64 hexagrams', () => {
    const map = buildZongGuaMap()
    expect(Object.keys(map)).toHaveLength(64)
    expect(map[3]).toBe(4)
    expect(map[4]).toBe(3)
    expect(map[1]).toBe(1)
  })

  it('自综卦 correctly map to themselves', () => {
    const map = buildZongGuaMap()
    for (const id of SELF_ZONG_GUA) {
      expect(map[id]).toBe(id)
    }
  })
})
