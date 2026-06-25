/**
 * 错卦（旁通卦）与综卦（反卦）计算
 *
 * 错卦: 每爻阴阳反转（阳→阴, 阴→阳）
 *   例: 乾☰☰ → 坤☷☷
 *
 * 综卦: 整个卦倒转180°（初爻↔上爻, 二爻↔五爻, 三爻↔四爻）
 *   例: 屯䷂ → 蒙䷃
 *   自综卦（8个）: 乾、坤、坎、离、大过、小过、颐、中孚
 */

import { linesToKingWen } from './hexagram-mapping.js'
import type { HexagramLines, LineValue } from '../types'

/**
 * 计算错卦 — 每爻阴阳反转
 * 阳(7,9) → 阴(6,8)，阴(6,8) → 阳(7,9)
 * 返回 King Wen 编号
 */
export function calculateCuoGua(lines: HexagramLines): number {
  const inverted = lines.map(invertLine) as HexagramLines
  return linesToKingWen(inverted)
}

/**
 * 计算综卦 — 卦象倒转180°
 * 初爻↔上爻, 二爻↔五爻, 三爻↔四爻
 * 返回 King Wen 编号
 */
export function calculateZongGua(lines: HexagramLines): number {
  const reversed: HexagramLines = [lines[5], lines[4], lines[3], lines[2], lines[1], lines[0]]
  return linesToKingWen(reversed)
}

/** 反转一爻的阴阳属性 */
function invertLine(v: LineValue): LineValue {
  if (v === 7 || v === 9) {
    return (v === 7 ? 8 : 6) as LineValue
  }
  return (v === 6 ? 9 : 7) as LineValue
}

/**
 * 预计算错卦映射表
 * 生成 { [KingWen编号]: 错卦编号 } 查找对象
 */
export function buildCuoGuaMap(): Record<number, number> {
  const map: Record<number, number> = {}
  for (let id = 1; id <= 64; id++) {
    map[id] = cuoGuaFromId(id)
  }
  return map
}

/**
 * 预计算综卦映射表
 * 生成 { [KingWen编号]: 综卦编号 } 查找对象
 */
export function buildZongGuaMap(): Record<number, number> {
  const map: Record<number, number> = {}
  for (let id = 1; id <= 64; id++) {
    map[id] = zongGuaFromId(id)
  }
  return map
}

/** 从 King Wen 编号生成表示阴阳的 6 爻值（7=阳, 8=阴） */
function idToLines(id: number): HexagramLines {
  const binary = KING_WEN_TO_BINARY[id]
  if (binary === undefined) throw new Error(`未知卦象编号: ${id}`)
  const lines: LineValue[] = []
  for (let i = 0; i < 6; i++) {
    const bit = (binary >> i) & 1
    lines.push((bit === 1 ? 7 : 8) as LineValue)
  }
  return lines as HexagramLines
}

/** King Wen 编号 → binary 反查表 */
const KING_WEN_TO_BINARY: Record<number, number> = {
  2: 0b000000, 24: 0b000001, 7: 0b000010, 19: 0b000011,
  15: 0b000100, 36: 0b000101, 46: 0b000110, 11: 0b000111,
  16: 0b001000, 51: 0b001001, 40: 0b001010, 54: 0b001011,
  62: 0b001100, 55: 0b001101, 32: 0b001110, 34: 0b001111,
  8: 0b010000, 3: 0b010001, 29: 0b010010, 60: 0b010011,
  39: 0b010100, 63: 0b010101, 48: 0b010110, 5: 0b010111,
  45: 0b011000, 17: 0b011001, 47: 0b011010, 58: 0b011011,
  31: 0b011100, 49: 0b011101, 28: 0b011110, 43: 0b011111,
  23: 0b100000, 27: 0b100001, 4: 0b100010, 41: 0b100011,
  52: 0b100100, 22: 0b100101, 18: 0b100110, 26: 0b100111,
  35: 0b101000, 21: 0b101001, 64: 0b101010, 38: 0b101011,
  56: 0b101100, 30: 0b101101, 50: 0b101110, 14: 0b101111,
  20: 0b110000, 42: 0b110001, 59: 0b110010, 61: 0b110011,
  53: 0b110100, 37: 0b110101, 57: 0b110110, 9: 0b110111,
  12: 0b111000, 25: 0b111001, 6: 0b111010, 10: 0b111011,
  33: 0b111100, 13: 0b111101, 44: 0b111110, 1: 0b111111,
}

function cuoGuaFromId(id: number): number {
  return calculateCuoGua(idToLines(id))
}

function zongGuaFromId(id: number): number {
  return calculateZongGua(idToLines(id))
}

/** 8 个自综卦（综卦为自身）的编号集合 */
export const SELF_ZONG_GUA: ReadonlySet<number> = new Set([1, 2, 29, 30, 28, 62, 27, 61])
