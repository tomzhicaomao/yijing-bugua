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
  countInWindow: number
  relatedRecordIds: string[]
}

// ========== Phase 1: 五行/干支/体用类型 ==========
export type Wuxing = '金' | '木' | '水' | '火' | '土'
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸'
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥'

export interface TimeContext {
  yearPillar: string
  monthZhi: DiZhi
  dayPillar: string
  dayStem: TianGan
  dayZhi: DiZhi
  season: '春' | '夏' | '秋' | '冬'
  monthWuxing: Wuxing
  wangElements: Wuxing[]
}

export interface TiYongRelation {
  tiElement: Wuxing
  yongElement: Wuxing
  relation: 'sheng' | 'ke' | 'bihe'
  direction: 'ti-sheng-yong' | 'yong-sheng-ti' | 'ti-ke-yong' | 'yong-ke-ti' | 'ti-yong-bihe'
  interpretation: string
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
  /** 彖传原文 */
  tuan: string
  image: string
  imageModern: string
  lines: HexagramLineData[]
}

// ========== Phase 4: 大六壬类型 ==========
/** 大六壬课式 JSONB（引擎层完整数据） */
export interface LiurenPanData {
  dateTime: string;
  solarTerm: string;
  yueJiang: string;
  shiZhi: string;
  dayGanZhi: string;
  isDaytime: boolean;
  geJu: string;
  siKe: Array<{ upperGod: string; lowerGod: string; relation: string }>;
  sanChuan: Array<{ branch: string; tianJiang: string; liuQin: string; dunGan: string }>;
  tianDiPan?: { diPan: string[]; tianPan: string[]; diToTian: Record<string, string> };
  tianJiang?: { guiRenBranch: string; direction: '顺' | '逆'; branchToJiang: Record<string, string> };
  shenSha?: Array<{ category: '吉' | '凶' | '中性'; name: string; branch: string }>;
  warnings: string[];
}

// ========== 2.5 DivinationRecord ==========
export interface DivinationRecord {
  schemaVersion: 1
  id: string
  timestamp: string
  question: string
  category: Category
  method: CastingMethod | 'liuren-zhengshi' | 'liuren-huoshi'
  beforeDivination?: BeforeDivination
  hexagram: {
    original: number
    changed: number | null
    changingLines: number[]
    mutual?: number
    /** Phase 1: 错卦编号 */
    cuoGua?: number
    /** Phase 1: 综卦编号 */
    zongGua?: number
    /** Phase 1: 体用生克关系 */
    tiYong?: TiYongRelation
    /** Phase 1: 时间干支上下文 */
    timeContext?: TimeContext
  }
  interpretations: InterpretationResult[]
  feedback: Feedback
  duplicate?: DuplicateInfo
  /** 大六壬完整课式（JSONB） */
  liurenPan?: LiurenPanData
  /** AI 解读结果 */
  interpretation?: InterpretationResult
}

// ========== Export format ==========
export interface ExportData {
  app: 'yijing-bugua'
  schemaVersion: 1
  exportedAt: string
  records: DivinationRecord[]
}
