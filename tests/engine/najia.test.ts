import { describe, it, expect } from 'vitest'
import { calculateNajia } from '../../src/engine/najia.js'
import type { HexagramLines, TimeContext } from '../../src/types'

const mockTime: TimeContext = {
  yearPillar: '甲辰', monthZhi: '午', dayPillar: '丙寅',
  dayStem: '丙', dayZhi: '寅', season: '夏', monthWuxing: '火', wangElements: ['火', '土'],
}
const lines: HexagramLines = [7, 7, 7, 7, 7, 7]

describe('卦宫映射', () => {
  it('64 卦都可计算且不抛异常', () => {
    for (let kw = 1; kw <= 64; kw++) {
      const r = calculateNajia(kw, lines, mockTime, '工作')
      expect(r.gongName).toBeTruthy()
      expect(r.lines).toHaveLength(6)
    }
  })
  it('gongName 格式正确', () => {
    expect(calculateNajia(1, lines, mockTime, '工作').gongName).toMatch(/^[乾坤坎离震巽艮兑]宫$/)
  })
})

describe('世应定位', () => {
  const shiYingCases: [number, string, number, number][] = [
    [1, '八纯', 6, 3], [44, '一世', 1, 4], [33, '二世', 2, 5],
    [12, '三世', 3, 6], [20, '四世', 4, 1], [23, '五世', 5, 2],
    [35, '游魂', 4, 1], [14, '归魂', 3, 6],
  ]
  for (const [kw, label, shi, ying] of shiYingCases) {
    it(`${kw} ${label} — 世${shi}应${ying}`, () => {
      const r = calculateNajia(kw, lines, mockTime, '工作')
      expect(r.lines.find(l => l.isShiYao)?.position).toBe(shi)
      expect(r.lines.find(l => l.isYingYao)?.position).toBe(ying)
    })
  }
})

describe('六亲', () => {
  it('乾宫(金): 初甲子水=子孙 二甲寅木=妻财 三甲辰土=父母', () => {
    const r = calculateNajia(1, lines, mockTime, '工作')
    expect(r.lines[0]).toMatchObject({ ganzhi: '甲子', liuQin: '子孙' })
    expect(r.lines[1]).toMatchObject({ ganzhi: '甲寅', liuQin: '妻财' })
    expect(r.lines[2]).toMatchObject({ ganzhi: '甲辰', liuQin: '父母' })
  })
})

describe('用神', () => {
  const cases: [string, string][] = [['工作','官鬼'],['人际','兄弟'],['财务','妻财'],['健康','子孙'],['其他','父母']]
  for (const [cat, liq] of cases) {
    it(`${cat} → ${liq}`, () => {
      const r = calculateNajia(1, lines, mockTime, cat as any)
      expect(r.yongShen?.liuQin).toBe(liq)
    })
  }
})

describe('旺衰', () => {
  it('午月火旺: 乾初水=死', () => {
    expect(calculateNajia(1, lines, mockTime, '工作').lines[0].wangShuai).toBe('死')
  })
  it('用神状态非空', () => {
    expect(calculateNajia(1, lines, mockTime, '工作').yongShenStatus.length).toBeGreaterThan(0)
  })
})

describe('边界', () => {
  it('无效卦号抛异常', () => {
    expect(() => calculateNajia(0, lines, mockTime, '工作')).toThrow()
    expect(() => calculateNajia(65, lines, mockTime, '工作')).toThrow()
  })
})
