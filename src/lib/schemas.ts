import { z } from 'zod'

// ========== Claims ==========
const claimTypeSchema = z.enum(['trend', 'condition', 'timeWindow', 'advice', 'answer'])
const claimSchema = z.object({
  id: z.string(),
  type: claimTypeSchema,
  text: z.string(),
})

// ========== Interpretation ==========
const trendSchema = z.enum(['利', '不利', '中性'])
const confidenceSchema = z.enum(['高', '中', '低'])
const interpretationTypeSchema = z.enum(['default', 'deep'])

export const interpretationResultSchema = z.object({
  id: z.string(),
  type: interpretationTypeSchema,
  trend: trendSchema,
  analysis: z.string(),
  conditions: z.array(z.string()),
  timeWindow: z.string(),
  answer: z.string(),
  confidence: confidenceSchema,
  model: z.string(),
  promptVersion: z.string(),
  temperature: z.number().optional(),
  rawResponse: z.string().optional(),
  claims: z.array(claimSchema).min(5),
})

// ========== AI reasoning output (first call JSON) ==========
export const aiReasoningSchema = z.object({
  trend: trendSchema,
  analysis: z.string(),
  conditions: z.array(z.string()),
  timeWindow: z.string(),
  answer: z.string(),
  confidence: confidenceSchema,
  claims: z.array(claimSchema).min(5),
})

// ========== Feedback ==========
const feedbackStatusSchema = z.enum(['pending', 'accurate', 'inaccurate', 'unclear'])
const claimFeedbackSchema = z.object({
  claimId: z.string(),
  status: z.enum(['hit', 'miss', 'unclear']),
})
const feedbackDetailSchema = z.object({
  actualResult: z.string().optional(),
  satisfaction: z.number().int().gte(1).lte(5).optional(),
  actualDuration: z.number().int().positive().optional(),
  actionTaken: z.string().optional(),
  aiInfluencedDecision: z.boolean().optional(),
  notes: z.string().optional(),
  claimFeedback: z.array(claimFeedbackSchema).optional(),
})
const feedbackSchema = z.object({
  dueAt: z.string().nullable(),
  status: feedbackStatusSchema,
  detail: feedbackDetailSchema.optional(),
})

// ========== Duplicate info ==========
const duplicateInfoSchema = z.object({
  countInWindow: z.number().int().gte(0),
  relatedRecordIds: z.array(z.string()),
})

// ========== Before divination ==========
const beforeDivinationSchema = z.object({
  userExpectation: z.string().optional(),
  userConfidence: z.number().int().gte(1).lte(5).optional(),
  intendedAction: z.string().optional(),
})

// ========== Category & method ==========
const categorySchema = z.enum(['工作', '人际', '财务', '健康', '其他'])
const methodSchema = z.enum(['virtual', 'manual'])

// ========== DivinationRecord ==========
export const divinationRecordSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string(),
  timestamp: z.string(),
  question: z.string().min(1),
  category: categorySchema,
  method: methodSchema,
  beforeDivination: beforeDivinationSchema.optional(),
  hexagram: z.object({
    original: z.number().int().gte(1).lte(64),
    changed: z.number().int().gte(1).lte(64).nullable(),
    changingLines: z.array(z.number().int().gte(1).lte(6)),
    mutual: z.number().int().gte(1).lte(64).optional(),
  }),
  interpretations: z.array(interpretationResultSchema),
  feedback: feedbackSchema,
  duplicate: duplicateInfoSchema.optional(),
})

// ========== Export JSON ==========
export const exportDataSchema = z.object({
  app: z.literal('yijing-bugua'),
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  records: z.array(divinationRecordSchema),
})
