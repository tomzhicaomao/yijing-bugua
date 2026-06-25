/**
 * 扫描 hexagrams.json 中缺失的 smallImage 字段
 *
 * 使用: npx tsx scripts/find-missing-small-images.ts
 */

import hexagrams from '../src/data/hexagrams.json' with { type: 'json' }

type HexagramEntry = {
  id: number
  name: string
  lines: Array<{
    position: number
    name: string
    text: string
    smallImage?: string
    smallImageModern?: string | null
  }>
}

const data = hexagrams as unknown as Record<string, HexagramEntry>
let missingCount = 0
let totalLines = 0

for (const key of Object.keys(data)) {
  const hex = data[key]
  if (!hex.lines) continue
  for (const line of hex.lines) {
    totalLines++
    const hasSmallImage = line.smallImage && line.smallImage.trim() !== ''
    const hasModern = line.smallImageModern && line.smallImageModern.trim() !== ''
    if (!hasSmallImage) {
      console.log(`${hex.name}卦 · ${line.name} "${line.text}" — 缺失 smallImage`)
      missingCount++
    }
    if (!hasModern) {
      console.log(`${hex.name}卦 · ${line.name} "${line.text}" — 缺失 smallImageModern`)
    }
  }
}

console.log(`\n共扫描 ${Object.keys(data).length} 卦 · ${totalLines} 条爻辞`)
console.log(`缺失 smallImage: ${missingCount} 条`)
