import { lookupHexagram, getLineText } from '../engine/hexagram-lookup.js'
import type { DivinationRecord } from '../types'

export interface FallbackInterpretation {
  summary: string
  details: string[]
}

/**
 * Generate a basic template-based interpretation when no AI is available.
 * Uses the hexagram data to provide structured plain-language guidance.
 */
export function generateFallbackInterpretation(record: DivinationRecord): FallbackInterpretation {
  const hexagram = lookupHexagram(record.hexagram.original)
  const changed = record.hexagram.changed ? lookupHexagram(record.hexagram.changed) : null
  const mutual = record.hexagram.mutual ? lookupHexagram(record.hexagram.mutual) : null

  if (!hexagram) {
    return {
      summary: '无法获取卦象信息',
      details: [],
    }
  }

  const details: string[] = []

  // Hexagram description
  const trigrams = `${hexagram.trigramLower}${hexagram.trigramUpper}`
  details.push(`本卦：${hexagram.name}（第${hexagram.id}卦）· ${trigrams}`)

  // Image / symbolism
  if (hexagram.imageModern) {
    details.push(`卦象：${hexagram.imageModern}`)
  }

  // Judgment in modern language
  if (hexagram.judgmentModern) {
    details.push(`卦辞：${hexagram.judgmentModern}`)
  }

  // Changed hexagram
  if (changed) {
    details.push(`变卦：${changed.name}（第${changed.id}卦）`)
  }

  // Mutual hexagram
  if (mutual) {
    details.push(`互卦：${mutual.name}（第${mutual.id}卦）`)
  }

  // Moving lines
  if (record.hexagram.changingLines.length > 0) {
    const lineList = record.hexagram.changingLines
      .map((p) => ['初', '二', '三', '四', '五', '上'][p - 1] + '爻')
      .join('、')
    details.push(`动爻：${lineList}（共${record.hexagram.changingLines.length}条）`)
  }

  // Build a plain-language summary
  let summary = hexagram.judgmentModern || hexagram.judgment

  if (changed) {
    const direction = record.hexagram.changingLines.length > 2
      ? '变化较多，需谨慎应对'
      : '有逐渐转好的趋势'
    summary += `。变卦为${changed.name}（${changed.namePinyin}），${direction}。`
  }

  if (record.hexagram.changingLines.length === 0) {
    summary += '。此卦无动爻，宜以静制动，观察形势再做决定。'
  } else if (record.hexagram.changingLines.length <= 2) {
    summary += '。动爻较少，变化温和，建议稳步推进。'
  } else if (record.hexagram.changingLines.length <= 4) {
    summary += '。动爻较多，变数较大，建议多方考虑再行动。'
  } else {
    summary += '。六爻皆动，事态变化剧烈，建议暂时观望。'
  }

  return { summary, details }
}
