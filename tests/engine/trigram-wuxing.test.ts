import { describe, it, expect } from 'vitest'
import {
  trigramToWuxing,
  calculateTiYong,
  getWuxingRelation,
  shengTo,
  keTo,
} from '../../src/engine/trigram-wuxing.js'
import type { HexagramLines } from '../../src/types'

describe('trigramToWuxing', () => {
  it('乾☰ → 金', () => {
    expect(trigramToWuxing('☰')).toBe('金')
  })
  it('兑☱ → 金', () => {
    expect(trigramToWuxing('☱')).toBe('金')
  })
  it('离☲ → 火', () => {
    expect(trigramToWuxing('☲')).toBe('火')
  })
  it('震☳ → 木', () => {
    expect(trigramToWuxing('☳')).toBe('木')
  })
  it('巽☴ → 木', () => {
    expect(trigramToWuxing('☴')).toBe('木')
  })
  it('坎☵ → 水', () => {
    expect(trigramToWuxing('☵')).toBe('水')
  })
  it('艮☶ → 土', () => {
    expect(trigramToWuxing('☶')).toBe('土')
  })
  it('坤☷ → 土', () => {
    expect(trigramToWuxing('☷')).toBe('土')
  })
  it('throws on invalid symbol', () => {
    expect(() => trigramToWuxing('⚌')).toThrow()
  })
})

describe('五行生克', () => {
  it('木生火', () => {
    expect(shengTo('木')).toBe('火')
  })
  it('金生水', () => {
    expect(shengTo('金')).toBe('水')
  })
  it('木克土', () => {
    expect(keTo('木')).toBe('土')
  })
  it('火克金', () => {
    expect(keTo('火')).toBe('金')
  })
  it('相同五行比和', () => {
    expect(getWuxingRelation('木', '木')).toBe('bihe')
  })
})

describe('calculateTiYong', () => {
  it('乾☰☰ 体用比和（金金）', () => {
    const lines: HexagramLines = [7, 7, 7, 7, 7, 7]
    const result = calculateTiYong(lines)
    expect(result.tiElement).toBe('金')
    expect(result.yongElement).toBe('金')
    expect(result.relation).toBe('bihe')
    expect(result.direction).toBe('ti-yong-bihe')
  })

  it('坤☷☷ 体用比和（土土）', () => {
    const lines: HexagramLines = [8, 8, 8, 8, 8, 8]
    const result = calculateTiYong(lines)
    expect(result.tiElement).toBe('土')
    expect(result.yongElement).toBe('土')
    expect(result.relation).toBe('bihe')
  })

  it('泰䷊（下乾☰金体, 上坤☷土用）→ 土生金 = 用生体', () => {
    const lines: HexagramLines = [7, 7, 7, 8, 8, 8]
    const result = calculateTiYong(lines)
    expect(result.tiElement).toBe('金')
    expect(result.yongElement).toBe('土')
    // 土生金 → 用生体（吉，得助得力）
    expect(result.relation).toBe('sheng')
    expect(result.direction).toBe('yong-sheng-ti')
  })

  it('否䷋（下坤☷土体, 上乾☰金用）→ 土生金 = 体生用', () => {
    const lines: HexagramLines = [8, 8, 8, 7, 7, 7]
    const result = calculateTiYong(lines)
    expect(result.tiElement).toBe('土')
    expect(result.yongElement).toBe('金')
    // 土生金 → 体生用（耗，你付出）
    expect(result.relation).toBe('sheng')
    expect(result.direction).toBe('ti-sheng-yong')
  })

  it('既济䷾（下离☲火体, 上坎☵水用）→ 用克体', () => {
    const lines: HexagramLines = [9, 8, 9, 8, 9, 8]
    const result = calculateTiYong(lines)
    expect(result.tiElement).toBe('火')
    expect(result.yongElement).toBe('水')
    expect(result.relation).toBe('ke')
    expect(result.direction).toBe('yong-ke-ti')
  })
})
