import type { LineValue } from '../types'
import { linesToKingWen } from './hexagram-mapping.js'

/**
 * Convert a coin toss result (number of backs facing up) to a LineValue.
 * 0 backs = 6 (老阴), 1 back = 7 (少阳), 2 backs = 8 (少阴), 3 backs = 9 (老阳)
 */
export function tossResultToLineValue(backCount: number): LineValue {
  const map: Record<number, LineValue> = { 0: 6, 1: 7, 2: 8, 3: 9 }
  const value = map[backCount]
  if (value === undefined) throw new Error(`Invalid back count: ${backCount}`)
  return value
}

/**
 * Simulate tossing three coins using crypto.getRandomValues().
 * Each coin: 0 = 字 (front), 1 = 背 (back).
 * Returns the count of 背 (back) results (0-3).
 */
export function tossThreeCoins(): number {
  const buf = new Uint8Array(3)
  crypto.getRandomValues(buf)
  // Each byte -> 0 or 1 (mod 2)
  return buf.reduce((count, byte) => count + (byte % 2), 0)
}


/**
 * Toss three coins and return individual results [coin1, coin2, coin3].
 * Each coin: 0 = 字 (front), 1 = 背 (back).
 * Also returns the total back count and the resulting LineValue.
 */
export function tossCoinsDetailed(): { coinResults: [number, number, number]; backCount: number; lineValue: LineValue } {
  const buf = new Uint8Array(3)
  crypto.getRandomValues(buf)
  const coinResults: [number, number, number] = [buf[0] % 2, buf[1] % 2, buf[2] % 2]
  const backCount = coinResults.reduce((c, v) => c + v, 0)
  return { coinResults, backCount, lineValue: tossResultToLineValue(backCount) }
}

/**
 * Cast one line: toss three coins and map to LineValue.
 */
export function castLine(): LineValue {
  return tossResultToLineValue(tossThreeCoins())
}

/**
 * Cast all 6 lines, returning array [初爻, 二爻, 三爻, 四爻, 五爻, 上爻].
 */
export function castSixLines(): [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue] {
  return [castLine(), castLine(), castLine(), castLine(), castLine(), castLine()]
}

export interface HexagramCalculation {
  original: number
  changed: number | null
  changingLines: number[]
}

/**
 * Calculate hexagram from 6 line values.
 * Pure function — deterministic, no side effects.
 */
export function calculateHexagram(
  lines: [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue],
): HexagramCalculation {
  const original = linesToKingWen(lines)

  // Find changing lines (positions 1-6 where value is 6 or 9)
  const changingLines: number[] = []
  const changedLines: LineValue[] = []
  for (let i = 0; i < 6; i++) {
    const val = lines[i]
    if (val === 6) {
      changingLines.push(i + 1) // 1-based position
      changedLines.push(7)      // 老阴 → 少阳
    } else if (val === 9) {
      changingLines.push(i + 1) // 1-based position
      changedLines.push(8)      // 老阳 → 少阴
    } else {
      changedLines.push(val)
    }
  }

  const changed =
    changingLines.length > 0
      ? linesToKingWen(changedLines as [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue])
      : null

  return { original, changed, changingLines }
}
