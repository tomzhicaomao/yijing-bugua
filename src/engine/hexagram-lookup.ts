import hexagrams from '../data/hexagrams.json' with { type: 'json' }
import type { HexagramData } from '../types'

const hexagramMap = hexagrams as unknown as Record<string, HexagramData>

/**
 * Look up hexagram data by King Wen number (1-64).
 * Returns null if id is out of range or not found.
 */
export function lookupHexagram(id: number): HexagramData | null {
  if (id < 1 || id > 64) return null
  return hexagramMap[String(id)] ?? null
}

export interface LineTextResult {
  type: 'judgment' | 'lines'
  text: string | string[]
  allMoving?: boolean
}

/**
 * Retrieve relevant line text based on moving line rules.
 */
export function getLineText(hexagramId: number, changingLines: number[]): LineTextResult {
  const hexagram = lookupHexagram(hexagramId)
  if (!hexagram) {
    return { type: 'judgment', text: '' }
  }

  if (changingLines.length === 0) {
    return { type: 'judgment', text: hexagram.judgment }
  }

  const texts = changingLines
    .sort((a, b) => a - b)
    .map((pos) => {
      const line = hexagram.lines.find((l) => l.position === pos)
      return line ? line.text : ''
    })
    .filter(Boolean)

  return {
    type: 'lines',
    text: texts,
    allMoving: changingLines.length === 6,
  }
}
