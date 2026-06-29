import { describe, it, expect } from 'vitest'
import {
  solarToGanzhi,
  solarToMonthZhi,
  getYearPillar,
  getTimeContext,
  zhiToWuxing,
  ganToWuxing,
  determineWangShuai,
} from '../../src/engine/calendar.js'


describe('solarToGanzhi — 日干支', () => {
  it('1900-01-01 = 甲戌日', () => {
    const result = solarToGanzhi(new Date(1900, 0, 1))
    expect(result.stem).toBe('甲')
    expect(result.branch).toBe('戌')
  })

  it('1900-01-02 = 乙亥日', () => {
    const result = solarToGanzhi(new Date(1900, 0, 2))
    expect(result.stem).toBe('乙')
    expect(result.branch).toBe('亥')
  })

  it('60 甲子循环验证', () => {
    const start = solarToGanzhi(new Date(1900, 0, 1))
    const after60 = solarToGanzhi(new Date(1900, 2, 2)) // 60 days later
    expect(after60.stem).toBe(start.stem)
    expect(after60.branch).toBe(start.branch)
  })
})

describe('getYearPillar — 年柱', () => {
  it('1984 = 甲子年', () => {
    expect(getYearPillar(1984)).toBe('甲子')
  })
  it('1900 = 庚子年', () => {
    expect(getYearPillar(1900)).toBe('庚子')
  })
  it('2024 = 甲辰年', () => {
    expect(getYearPillar(2024)).toBe('甲辰')
  })
  it('2026 = 丙午年', () => {
    expect(getYearPillar(2026)).toBe('丙午')
  })
})

describe('solarToMonthZhi — 月建', () => {
  it('2月4日 → 寅月（立春）', () => {
    expect(solarToMonthZhi(new Date(2024, 1, 4))).toBe('寅')
  })
  it('6月6日 → 午月（芒种）', () => {
    expect(solarToMonthZhi(new Date(2024, 5, 6))).toBe('午')
  })
  it('四季月: 辰戌丑未', () => {
    expect(solarToMonthZhi(new Date(2024, 3, 5))).toBe('辰')
    expect(solarToMonthZhi(new Date(2024, 6, 7))).toBe('未')
    expect(solarToMonthZhi(new Date(2024, 9, 8))).toBe('戌')
    expect(solarToMonthZhi(new Date(2025, 0, 6))).toBe('丑')
  })
})

describe('getTimeContext — 集成', () => {
  it('2024-06-24 返回完整上下文', () => {
    const ctx = getTimeContext(new Date(2024, 5, 24, 12, 0, 0))
    expect(ctx.yearPillar).toBe('甲辰')
    expect(ctx.monthZhi).toBe('午')
    expect(ctx.season).toBe('夏')
    expect(ctx.monthWuxing).toBe('火')
    expect(ctx.wangElements).toContain('火')
  })
})

describe('五行映射', () => {
  it('地支五行', () => {
    expect(zhiToWuxing('子')).toBe('水')
    expect(zhiToWuxing('午')).toBe('火')
    expect(zhiToWuxing('寅')).toBe('木')
    expect(zhiToWuxing('申')).toBe('金')
    expect(zhiToWuxing('丑')).toBe('土')
  })
  it('天干五行', () => {
    expect(ganToWuxing('甲')).toBe('木')
    expect(ganToWuxing('丙')).toBe('火')
    expect(ganToWuxing('庚')).toBe('金')
  })
})

describe('determineWangShuai — 旺衰', () => {
  it('午月(火旺)', () => {
    expect(determineWangShuai('火', '火')).toBe('旺')
    expect(determineWangShuai('木', '火')).toBe('相')
    expect(determineWangShuai('土', '火')).toBe('休')
    expect(determineWangShuai('金', '火')).toBe('囚')
    expect(determineWangShuai('水', '火')).toBe('死')
  })
  it('子月(水旺)', () => {
    expect(determineWangShuai('水', '水')).toBe('旺')
    expect(determineWangShuai('金', '水')).toBe('相')
    expect(determineWangShuai('木', '水')).toBe('休')
    expect(determineWangShuai('火', '水')).toBe('囚')
    expect(determineWangShuai('土', '水')).toBe('死')
  })
})
