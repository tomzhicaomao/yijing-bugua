/**
 * 简版纳甲系统
 *
 * 基于京房八宫卦体系：
 * - 八卦纳干（甲壬乾、乙癸坤等）
 * - 八卦纳支（阳卦顺行、阴卦逆行）
 * - 六亲计算（以卦宫五行为"我"）
 * - 世应定位
 * - 用神选择
 */

import type { Category, Wuxing, HexagramLines, DiZhi, TimeContext } from '../types'
import { zhiToWuxing } from './calendar.js'

// ========== Types ==========

export type LiuQin = '父母' | '兄弟' | '妻财' | '官鬼' | '子孙'
export type WangShuai = '旺' | '相' | '休' | '囚' | '死'

export interface NajiaLine {
  position: number
  ganzhi: string
  liuQin: LiuQin
  isShiYao: boolean
  isYingYao: boolean
  wangShuai: WangShuai
  isYongShen: boolean
  chenWuXing: Wuxing
}

export interface NajiaResult {
  lines: NajiaLine[]
  gongName: string
  gongWuxing: Wuxing
  yongShen: NajiaLine | null
  yongShenStatus: string
  shiYao: NajiaLine | null
  yingYao: NajiaLine | null
}

// ========== Data ==========

import najiaBagua from '../data/najia-bagua.json' with { type: 'json' }

interface BaguaNayi {
  gongName: string
  wuxing: Wuxing
  nazhi: string[]
  gan: string
  isYang: boolean
}

const BA_GUA = najiaBagua as unknown as Record<string, BaguaNayi>

// 五行生克辅助
function sheng(a: Wuxing, b: Wuxing): boolean {
  return ({ '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' } as Record<Wuxing, Wuxing>)[a] === b
}
function ke(a: Wuxing, b: Wuxing): boolean {
  return ({ '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' } as Record<Wuxing, Wuxing>)[a] === b
}

function calcLiuQin(gWx: Wuxing, zWx: Wuxing): LiuQin {
  if (gWx === zWx) return '兄弟'
  if (sheng(gWx, zWx)) return '子孙'
  if (sheng(zWx, gWx)) return '父母'
  if (ke(gWx, zWx)) return '妻财'
  return '官鬼'
}

function yongShenType(cat: Category): LiuQin {
  const map: Record<Category, LiuQin> = { '工作': '官鬼', '人际': '兄弟', '财务': '妻财', '健康': '子孙', '其他': '父母' }
  return map[cat]
}

function wangShuai(lWx: Wuxing, mWx: Wuxing): WangShuai {
  if (lWx === mWx) return '旺'          // 同我者旺
  if (sheng(lWx, mWx)) return '相'      // 生我者相: element 生 month
  if (sheng(mWx, lWx)) return '休'      // 我生者休: month 生 element
  if (ke(mWx, lWx)) return '囚'         // 我克者囚: month 克 element
  return '死'                             // 克我者死: element 克 month
}

// ========== 64 卦宫映射（京房八宫卦）==========

interface GongInfo { trigramKey: string; generation: number }

const GONG_MAP: Record<number, GongInfo> = {
  // 乾宫 (金): 乾→姤→遁→否→观→剥→晋→大有
  1:  { trigramKey: '乾', generation: 0 },
  44: { trigramKey: '乾', generation: 1 },
  33: { trigramKey: '乾', generation: 2 },
  12: { trigramKey: '乾', generation: 3 },
  20: { trigramKey: '乾', generation: 4 },
  23: { trigramKey: '乾', generation: 5 },
  35: { trigramKey: '乾', generation: 6 },
  14: { trigramKey: '乾', generation: 7 },
  // 坎宫 (水): 坎→节→屯→既济→革→丰→明夷→师
  29: { trigramKey: '坎', generation: 0 },
  60: { trigramKey: '坎', generation: 1 },
  3:  { trigramKey: '坎', generation: 2 },
  63: { trigramKey: '坎', generation: 3 },
  49: { trigramKey: '坎', generation: 4 },
  55: { trigramKey: '坎', generation: 5 },
  36: { trigramKey: '坎', generation: 6 },
  7:  { trigramKey: '坎', generation: 7 },
  // 艮宫 (土): 艮→贲→大畜→损→睽→履→中孚→渐
  52: { trigramKey: '艮', generation: 0 },
  22: { trigramKey: '艮', generation: 1 },
  26: { trigramKey: '艮', generation: 2 },
  41: { trigramKey: '艮', generation: 3 },
  38: { trigramKey: '艮', generation: 4 },
  10: { trigramKey: '艮', generation: 5 },
  61: { trigramKey: '艮', generation: 6 },
  53: { trigramKey: '艮', generation: 7 },
  // 震宫 (木): 震→豫→解→恒→升→井→大过→随
  51: { trigramKey: '震', generation: 0 },
  16: { trigramKey: '震', generation: 1 },
  40: { trigramKey: '震', generation: 2 },
  32: { trigramKey: '震', generation: 3 },
  46: { trigramKey: '震', generation: 4 },
  48: { trigramKey: '震', generation: 5 },
  28: { trigramKey: '震', generation: 6 },
  17: { trigramKey: '震', generation: 7 },
  // 巽宫 (木): 巽→小畜→家人→益→无妄→噬嗑→颐→蛊
  57: { trigramKey: '巽', generation: 0 },
  9:  { trigramKey: '巽', generation: 1 },
  37: { trigramKey: '巽', generation: 2 },
  42: { trigramKey: '巽', generation: 3 },
  25: { trigramKey: '巽', generation: 4 },
  21: { trigramKey: '巽', generation: 5 },
  27: { trigramKey: '巽', generation: 6 },
  18: { trigramKey: '巽', generation: 7 },
  // 离宫 (火): 离→旅→鼎→未济→蒙→涣→讼→同人
  30: { trigramKey: '离', generation: 0 },
  56: { trigramKey: '离', generation: 1 },
  50: { trigramKey: '离', generation: 2 },
  64: { trigramKey: '离', generation: 3 },
  4:  { trigramKey: '离', generation: 4 },
  59: { trigramKey: '离', generation: 5 },
  6:  { trigramKey: '离', generation: 6 },
  13: { trigramKey: '离', generation: 7 },
  // 坤宫 (土): 坤→复→临→泰→大壮→夬→需→比
  2:  { trigramKey: '坤', generation: 0 },
  24: { trigramKey: '坤', generation: 1 },
  19: { trigramKey: '坤', generation: 2 },
  11: { trigramKey: '坤', generation: 3 },
  34: { trigramKey: '坤', generation: 4 },
  43: { trigramKey: '坤', generation: 5 },
  5:  { trigramKey: '坤', generation: 6 },
  8:  { trigramKey: '坤', generation: 7 },
  // 兑宫 (金): 兑→困→萃→咸→蹇→谦→小过→归妹
  58: { trigramKey: '兑', generation: 0 },
  47: { trigramKey: '兑', generation: 1 },
  45: { trigramKey: '兑', generation: 2 },
  31: { trigramKey: '兑', generation: 3 },
  39: { trigramKey: '兑', generation: 4 },
  15: { trigramKey: '兑', generation: 5 },
  62: { trigramKey: '兑', generation: 6 },
  54: { trigramKey: '兑', generation: 7 },
}

function getShiYing(gen: number): { shi: number; ying: number } {
  const map: Record<number, [number, number]> = {
    0: [6, 3], 1: [1, 4], 2: [2, 5], 3: [3, 6],
    4: [4, 1], 5: [5, 2], 6: [4, 1], 7: [3, 6],
  }
  const [s, y] = map[gen] ?? [6, 3]
  return { shi: s, ying: y }
}

// ========== 公共接口 ==========

export function calculateNajia(
  kingWenNumber: number,
  _lines: HexagramLines,
  timeContext: TimeContext,
  category: Category,
): NajiaResult {
  const gongInfo = GONG_MAP[kingWenNumber]
  if (!gongInfo) throw new Error(`未知卦宫: #${kingWenNumber}`)

  const gongData = BA_GUA[gongInfo.trigramKey]
  if (!gongData) throw new Error(`未知卦宫数据: ${gongInfo.trigramKey}`)

  const { shi, ying } = getShiYing(gongInfo.generation)
  const yongType = yongShenType(category)

  const najiaLines: NajiaLine[] = []
  let yongShen: NajiaLine | null = null

  for (let i = 0; i < 6; i++) {
    const pos = i + 1
    const zhi = gongData.nazhi[i] as DiZhi
    const ganzhi = gongData.gan + zhi
    const zhiWx = zhiToWuxing(zhi)
    const lq = calcLiuQin(gongData.wuxing, zhiWx)
    const isYong = lq === yongType

    const line: NajiaLine = {
      position: pos,
      ganzhi,
      liuQin: lq,
      isShiYao: pos === shi,
      isYingYao: pos === ying,
      wangShuai: wangShuai(zhiWx, timeContext.monthWuxing),
      isYongShen: isYong,
      chenWuXing: zhiWx,
    }

    if (isYong) yongShen = line
    najiaLines.push(line)
  }

  if (!yongShen) yongShen = najiaLines.find(l => l.isYingYao) ?? najiaLines[3]

  const yongShenStatus = yongShen
    ? describeYongShenStatus(yongShen, timeContext)
    : '无'

  return {
    lines: najiaLines,
    gongName: gongData.gongName,
    gongWuxing: gongData.wuxing,
    yongShen,
    yongShenStatus,
    shiYao: najiaLines.find(l => l.isShiYao) ?? null,
    yingYao: najiaLines.find(l => l.isYingYao) ?? null,
  }
}

function describeYongShenStatus(line: NajiaLine, tc: TimeContext): string {
  const s: string[] = []
  if (line.wangShuai === '旺') s.push('得月建旺气')
  else if (line.wangShuai === '相') s.push('得月建生助')
  if (line.ganzhi.endsWith(tc.dayZhi)) s.push('临日辰旺')
  if (s.length === 0) {
    if (line.wangShuai === '休') s.push('休囚无力')
    else if (line.wangShuai === '囚') s.push('受月建所克')
    else if (line.wangShuai === '死') s.push('月建克之极')
    else s.push('平')
  }
  return s.join('，')
}
