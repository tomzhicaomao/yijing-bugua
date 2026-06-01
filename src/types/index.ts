// ========== 2.1 LineValue ==========
/** Line value from coin casting: 6=老阴, 7=少阳, 8=少阴, 9=老阳 */
export type LineValue = 6 | 7 | 8 | 9

/** Six-line array: index 0 = 初爻, index 5 = 上爻 */
export type HexagramLines = [LineValue, LineValue, LineValue, LineValue, LineValue, LineValue]

// ========== 2.4 Casting method & Category ==========
export type CastingMethod = 'virtual' | 'manual'
export type Category = '工作' | '人际' | '财务' | '健康' | '其他'

// ========== 2.4 Feedback types ==========
export type FeedbackStatus = 'pending' | 'accurate' | 'inaccurate' | 'unclear'
export type ClaimType = 'trend' | 'condition' | 'timeWindow' | 'advice' | 'answer'
export type InterpretationType = 'default' | 'deep'
export type Trend = '利' | '不利' | '中性'
export type ConfidenceLevel = '高' | '中' | '低'

// ========== 2.3 InterpretationResult ==========
export interface Claim {
  id: string
  type: ClaimType
  text: string
}

export interface InterpretationResult {
  id: string
  type: InterpretationType
  trend: Trend
  analysis: string
  conditions: string[]
  timeWindow: string
  answer: string
  confidence: ConfidenceLevel
  model: string
  promptVersion: string
  temperature?: number
  rawResponse?: string
  claims: Claim[]
}

// ========== 2.4 Feedback types ==========
export interface ClaimFeedback {
  claimId: string
  status: 'hit' | 'miss' | 'unclear'
}

export interface FeedbackDetail {
  actualResult?: string
  satisfaction?: number
  actualDuration?: number
  actionTaken?: string
  aiInfluencedDecision?: boolean
  notes?: string
  claimFeedback?: ClaimFeedback[]
}

export interface Feedback {
  dueAt: string | null
  status: FeedbackStatus
  detail?: FeedbackDetail
}

// ========== 2.5 DivinationRecord supporting types ==========
export interface BeforeDivination {
  userExpectation?: string
  userConfidence?: number
  intendedAction?: string
}

export interface DuplicateInfo {
  countWithin24h: number
  relatedRecordIds: string[]
}

// ========== 2.2 HexagramData ==========
export interface HexagramLineData {
  position: number
  name: string
  text: string
  modern: string
  /** 小象辞原文（爻级象辞），乾卦用九/坤卦用六可为 undefined */
  smallImage?: string
  /** 小象辞白话译文 */
  smallImageModern?: string
}

export interface HexagramData {
  id: number
  name: string
  namePinyin: string
  trigramUpper: string
  trigramLower: string
  judgment: string
  judgmentModern: string
  image: string
  imageModern: string
  lines: HexagramLineData[]
}

// ========== 2.5 DivinationRecord ==========
export interface DivinationRecord {
  schemaVersion: 1
  id: string
  timestamp: string
  question: string
  category: Category
  method: CastingMethod
  beforeDivination?: BeforeDivination
  hexagram: {
    original: number
    changed: number | null
    changingLines: number[]
  }
  interpretations: InterpretationResult[]
  feedback: Feedback
  duplicate?: DuplicateInfo
}

// ========== Export format ==========
export interface ExportData {
  app: 'yijing-bugua'
  schemaVersion: 1
  exportedAt: string
  records: DivinationRecord[]
}
