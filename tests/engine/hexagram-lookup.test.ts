import { describe, it, expect } from 'vitest'
import { lookupHexagram, getLineText } from '../../src/engine/hexagram-lookup.js'

// ===== 3.7 Hexagram lookup tests =====
describe('lookupHexagram', () => {
  it('returns乾卦 data for id 1', () => {
    const h = lookupHexagram(1)
    expect(h).not.toBeNull()
    expect(h!.name).toBe('乾')
    expect(h!.namePinyin).toBe('qian')
    expect(h!.lines).toHaveLength(7)
    // 乾卦 has 7 lines: 6 regular + 用九 at position 0
    expect(h!.lines.filter(l => l.position > 0)).toHaveLength(6)
    expect(h!.lines.filter(l => l.position === 0 && l.name === '用九')).toHaveLength(1)
  })

  it('returns坤卦 data for id 2', () => {
    const h = lookupHexagram(2)
    expect(h).not.toBeNull()
    expect(h!.name).toBe('坤')
  })

  it('returns null for invalid id (0)', () => {
    expect(lookupHexagram(0)).toBeNull()
  })

  it('returns null for invalid id (65)', () => {
    expect(lookupHexagram(65)).toBeNull()
  })

  it('returns null for non-existent id (999)', () => {
    expect(lookupHexagram(999)).toBeNull()
  })
})

// ===== 3.9 Line text retrieval tests =====
describe('getLineText', () => {
  it('静卦 returns judgment (no moving lines)', () => {
    const result = getLineText(1, [])
    expect(result.type).toBe('judgment')
    expect(result.text).toBeTruthy()
  })

  it('单动爻 returns that line text', () => {
    const result = getLineText(1, [3])
    expect(result.type).toBe('lines')
    expect(Array.isArray(result.text)).toBe(true)
    // Expect 3 items: one per line returned
  })

  it('多动爻 returns all moving line texts', () => {
    const result = getLineText(1, [2, 5])
    expect(result.type).toBe('lines')
    expect(result.text).toHaveLength(2)
  })

  it('六爻皆动 marks all six lines', () => {
    const result = getLineText(1, [1, 2, 3, 4, 5, 6])
    expect(result.type).toBe('lines')
    expect(result.text).toHaveLength(6)
    expect(result.allMoving).toBe(true)
  })
})
