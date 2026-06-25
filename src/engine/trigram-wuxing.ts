/**
 * 八卦五行属性与体用生克计算
 *
 * 八卦五行:
 *   乾☰ 兑☱ = 金
 *   离☲     = 火
 *   震☳ 巽☴ = 木
 *   坎☵     = 水
 *   艮☶ 坤☷ = 土
 *
 * 五行生克:
 *   生: 木→火→土→金→水→木
 *   克: 木→土→水→火→金→木
 *
 * 体用关系 (下卦为体=我, 上卦为用=事):
 *   体生用 → 耗泄自身
 *   用生体 → 得助得力
 *   体克用 → 可以掌控
 *   用克体 → 受制于人
 *   体用比和 → 顺遂和谐
 */

import type { HexagramLines, Wuxing, TiYongRelation } from '../types'
import { lookupHexagram } from './hexagram-lookup.js'
import { linesToKingWen } from './hexagram-mapping.js'

export type TiYongDirection = TiYongRelation['direction']

// ========== Data ==========

/** 八卦 → 五行映射 */
const TRIGRAM_TO_WUXING: Record<string, Wuxing> = {
  '☰': '金',  // 乾
  '☱': '金',  // 兑
  '☲': '火',  // 离
  '☳': '木',  // 震
  '☴': '木',  // 巽
  '☵': '水',  // 坎
  '☶': '土',  // 艮
  '☷': '土',  // 坤
}

/** 五行相生循环：木→火→土→金→水→木 */
const SHENG_CYCLE: Record<Wuxing, Wuxing> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
}

/** 五行相克循环：木→土→水→火→金→木 */
const KE_CYCLE: Record<Wuxing, Wuxing> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
}

// ========== Functions ==========

/** 根据八卦符号获取五行 */
export function trigramToWuxing(trigramSymbol: string): Wuxing {
  const wuxing = TRIGRAM_TO_WUXING[trigramSymbol]
  if (!wuxing) throw new Error(`未知八卦符号: ${trigramSymbol}`)
  return wuxing
}

/** 返回某五行所生的五行（如 木 → 火） */
export function shengTo(element: Wuxing): Wuxing {
  return SHENG_CYCLE[element]
}

/** 返回某五行所克的五行（如 木 → 土） */
export function keTo(element: Wuxing): Wuxing {
  return KE_CYCLE[element]
}

/**
 * 判断两个五行的生克关系（从 a 的视角）
 * - 'sheng': a 生 b  或 b 克 a → b 被 a 影响
 * - 'ke':    a 克 b  或 b 生 a → a 被 b 制约
 * - 'bihe':  相同五行
 */
export function getWuxingRelation(a: Wuxing, b: Wuxing): 'sheng' | 'ke' | 'bihe' {
  if (a === b) return 'bihe'
  if (SHENG_CYCLE[a] === b) return 'sheng'   // a 生 b
  if (KE_CYCLE[a] === b) return 'ke'          // a 克 b
  if (SHENG_CYCLE[b] === a) return 'ke'       // b 生 a → a 被生 → 从 a 视角是被克？不对
  // Let's re-think: from a's perspective:
  // a 生 b  → a主动付出 → sheng
  // b 生 a  → a被动得益 → 这也是sheng（但方向不同）
  // a 克 b  → a掌控局面 → ke
  // b 克 a  → a受制于人 → 这也是ke
  // We need directional info. Use the raw direction instead.
  if (KE_CYCLE[b] === a) return 'sheng'
  return 'bihe'
}

/** 精确判断五行关系：返回 a 相对于 b 的角色 */
export function getWuxingRole(a: Wuxing, b: Wuxing): 'sheng' | 'ke' | 'tong' | 'bei-sheng' | 'bei-ke' {
  if (a === b) return 'tong'
  if (SHENG_CYCLE[a] === b) return 'sheng'     // a 生 b
  if (KE_CYCLE[a] === b) return 'ke'            // a 克 b
  if (SHENG_CYCLE[b] === a) return 'bei-sheng'  // b 生 a ← a 被生
  if (KE_CYCLE[b] === a) return 'bei-ke'        // b 克 a ← a 被克
  return 'tong' // fallback
}

/** 从本卦 lines 计算体用生克关系 */
export function calculateTiYong(lines: HexagramLines): TiYongRelation {
  const hexagram = lookupHexagramFromLines(lines)

  const tiSymbol = hexagram.trigramLower   // 下卦为体 = 我
  const yongSymbol = hexagram.trigramUpper // 上卦为用 = 事

  const tiElement = trigramToWuxing(tiSymbol)
  const yongElement = trigramToWuxing(yongSymbol)

  // 判断关系方向
  let direction: TiYongDirection
  let relation: 'sheng' | 'ke' | 'bihe'

  if (tiElement === yongElement) {
    relation = 'bihe'
    direction = 'ti-yong-bihe'
  } else if (SHENG_CYCLE[tiElement] === yongElement) {
    // 体生用 — 你生事情，你付出
    relation = 'sheng'
    direction = 'ti-sheng-yong'
  } else if (SHENG_CYCLE[yongElement] === tiElement) {
    // 用生体 — 事情生你，得助
    relation = 'sheng'
    direction = 'yong-sheng-ti'
  } else if (KE_CYCLE[tiElement] === yongElement) {
    // 体克用 — 你克制事情
    relation = 'ke'
    direction = 'ti-ke-yong'
  } else {
    // 用克体 — 事情克制你
    relation = 'ke'
    direction = 'yong-ke-ti'
  }

  const interpretation = getTiYongInterpretation(direction, tiElement, yongElement)

  return { tiElement, yongElement, relation, direction, interpretation }
}

/** 根据方向生成中文解释 */
function getTiYongInterpretation(
  direction: TiYongDirection,
  ti: Wuxing,
  yong: Wuxing,
): string {
  switch (direction) {
    case 'ti-sheng-yong':
      return `体${ti}生用${yong}：你付出，被事情消耗`
    case 'yong-sheng-ti':
      return `用${yong}生体${ti}：得助得力，事情对你有利`
    case 'ti-ke-yong':
      return `体${ti}克用${yong}：你能掌控局面`
    case 'yong-ke-ti':
      return `用${yong}克体${ti}：受制于人，事情克制你`
    case 'ti-yong-bihe':
      return `体用皆${ti}：内外一致，顺遂和谐`
  }
}

/** 从 lines 查找完整的卦数据 */
function lookupHexagramFromLines(lines: HexagramLines) {
  const kw = linesToKingWen(lines)
  const hexagram = lookupHexagram(kw)
  if (!hexagram) throw new Error(`无法找到第${kw}卦的数据`)
  return hexagram
}
