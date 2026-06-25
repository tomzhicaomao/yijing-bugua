/**
 * 大衍筮法 — 传统蓍草占卜模拟
 *
 * 据《易传·系辞上》第九章:
 * 大衍之数五十，其用四十有九。分而为二以象两，挂一以象三，
 * 揲之以四以象四时，归奇于扐以象闰。
 *
 * 实现策略：加权随机 + 模拟过程数据
 *   老阴(6): 1/16 = 6.25%
 *   少阳(7): 5/16 = 31.25%
 *   少阴(8): 7/16 = 43.75%
 *   老阳(9): 3/16 = 18.75%
 */

import type { LineValue } from '../types'

/** 三变过程的中间数据（用于 UI 动画展示）*/
export interface ThreeChangeDetail {
  changeNumber: 1 | 2 | 3
  leftHandCount: number       // 左手策数
  rightHandCount: number      // 右手策数
  remainderTotal: number      // 挂扐之余（一变=5或9, 二三变=4或8）
  remaining: number           // 续用策数
}

/** 一爻的完整投掷过程 */
export interface YarrowCastingDetail {
  lineValue: LineValue
  threeChanges: [ThreeChangeDetail, ThreeChangeDetail, ThreeChangeDetail]
  finalBundles: number        // 三变后剩余策数 ÷ 4
}

// ========== 概率权重 ==========
const W6 = 1   // 老阴 1/16
const W7 = 5   // 少阳 5/16
const W8 = 7   // 少阴 7/16
const W9 = 3   // 老阳 3/16
const TOTAL_WEIGHT = W6 + W7 + W8 + W9

// ========== 核心函数 ==========

function weightedYarrowSample(): LineValue {
  const r = Math.random() * TOTAL_WEIGHT
  if (r < W6) return 6
  if (r < W6 + W7) return 7
  if (r < W6 + W7 + W8) return 8
  return 9
}

function generateThreeChanges(lineValue: LineValue): [ThreeChangeDetail, ThreeChangeDetail, ThreeChangeDetail] {
  const finalBundles: Record<LineValue, number> = { 6: 24, 7: 28, 8: 32, 9: 36 }
  const targetRemaining = finalBundles[lineValue]

  const changes: ThreeChangeDetail[] = []
  let currentRemaining = targetRemaining

  for (let i = 2; i >= 0; i--) {
    const changeNumber = (i + 1) as 1 | 2 | 3
    const isFirstChange = changeNumber === 1
    const prevRemaining = isFirstChange ? 49 : Math.round(currentRemaining * 1.45)
    const totalForChange = isFirstChange ? 49 : prevRemaining - 1
    const splitPoint = Math.floor(totalForChange * (0.3 + Math.random() * 0.4))
    const leftHand = Math.max(1, splitPoint)
    const rightHand = totalForChange - leftHand
    const leftRemainder = leftHand % 4 || 4
    const rightRemainder = rightHand % 4 || 4
    const remainderTotal = 1 + leftRemainder + rightRemainder

    const validRemainder = isFirstChange
      ? (remainderTotal === 5 || remainderTotal === 9 ? remainderTotal : (remainderTotal < 7 ? 5 : 9))
      : (remainderTotal === 4 || remainderTotal === 8 ? remainderTotal : (remainderTotal < 6 ? 4 : 8))

    const remaining = isFirstChange
      ? 49 - validRemainder
      : prevRemaining - 1 - validRemainder

    changes.unshift({
      changeNumber,
      leftHandCount: leftHand,
      rightHandCount: rightHand,
      remainderTotal: validRemainder,
      remaining,
    })
  }

  return changes as [ThreeChangeDetail, ThreeChangeDetail, ThreeChangeDetail]
}

/** 投掷一爻（大衍筮法）*/
export function castYarrowLine(): YarrowCastingDetail {
  const lineValue = weightedYarrowSample()
  const threeChanges = generateThreeChanges(lineValue)
  const finalBundles: Record<LineValue, number> = { 6: 24, 7: 28, 8: 32, 9: 36 }
  return { lineValue, threeChanges, finalBundles: finalBundles[lineValue] }
}

/** 投掷六爻 */
export function castSixYarrowLines(): YarrowCastingDetail[] {
  return Array.from({ length: 6 }, () => castYarrowLine())
}

/** 快捷版：只返回爻值 */
export function castYarrowLineSimple(): LineValue {
  return weightedYarrowSample()
}

/** 投掷六爻（快捷版）*/
export function castSixYarrowLinesSimple(): LineValue[] {
  return Array.from({ length: 6 }, () => castYarrowLineSimple())
}
