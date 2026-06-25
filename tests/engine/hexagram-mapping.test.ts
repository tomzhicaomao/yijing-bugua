import { describe, it, expect } from 'vitest'
import { linesToBinary, binaryToKingWen, linesToKingWen, MAPPING_SIZE } from '../../src/engine/hexagram-mapping.js'

describe('linesToBinary', () => {
  it('全阳(7) → 0b111111 = 63', () => expect(linesToBinary([7, 7, 7, 7, 7, 7])).toBe(0b111111))
  it('全阴(8) → 0', () => expect(linesToBinary([8, 8, 8, 8, 8, 8])).toBe(0))
  it('初爻=LSB 上爻=MSB', () => {
    expect(linesToBinary([7, 8, 8, 8, 8, 8])).toBe(1)
    expect(linesToBinary([8, 8, 8, 8, 8, 7])).toBe(32)
  })
})

describe('binaryToKingWen', () => {
  it('0b111111 → 1(乾)', () => expect(binaryToKingWen(0b111111)).toBe(1))
  it('0b000000 → 2(坤)', () => expect(binaryToKingWen(0b000000)).toBe(2))
  it('0b010101 → 63(既济)', () => expect(binaryToKingWen(0b010101)).toBe(63))
  it('0b101010 → 64(未济)', () => expect(binaryToKingWen(0b101010)).toBe(64))
  it('无效抛错', () => expect(() => binaryToKingWen(99)).toThrow())
})

describe('linesToKingWen', () => {
  it('全7=乾', () => expect(linesToKingWen([7, 7, 7, 7, 7, 7])).toBe(1))
  it('全8=坤', () => expect(linesToKingWen([8, 8, 8, 8, 8, 8])).toBe(2))
  it('既济', () => expect(linesToKingWen([9, 8, 9, 8, 9, 8])).toBe(63))
  it('未济', () => expect(linesToKingWen([8, 9, 8, 9, 8, 9])).toBe(64))
})

describe('64 卦完整性', () => {
  it('MAPPING_SIZE=64', () => expect(MAPPING_SIZE).toBe(64))
  it('每卦可逆', () => {
    for (let kw = 1; kw <= 64; kw++) {
      let found = false
      for (let b = 0; b < 64; b++) {
        try { if (binaryToKingWen(b) === kw) found = true } catch { /* skip */ }
      }
      expect(found).toBe(true)
    }
  })
})
