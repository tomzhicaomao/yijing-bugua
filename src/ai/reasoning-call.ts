import { callDeepSeek, type DeepSeekMessage } from "./deepseek-client.js"
import { DEFAULT_MODEL, DEEP_MODEL, DEFAULT_TEMPERATURE, PROMPT_VERSION } from "../lib/constants.js"
import { aiReasoningSchema } from "../lib/schemas.js"
import { buildReasoningSystemPrompt, buildReasoningUserPrompt } from "./prompt-builder.js"
import type { InterpretationResult, Trend, ConfidenceLevel } from "../types"
import { v4 as uuidv4 } from "uuid"

interface ReasoningInput {
  question: string
  hexagramOriginal: number
  hexagramChanged: number | null
  changingLines: number[]
}

export interface ReasoningCallResult {
  success: boolean
  interpretation?: InterpretationResult
  error?: string
}

export async function callReasoning(
  input: ReasoningInput,
  model: string = DEFAULT_MODEL,
): Promise<ReasoningCallResult> {
  const systemPrompt = buildReasoningSystemPrompt()
  const userPrompt = buildReasoningUserPrompt({
    question: input.question,
    hexagramOriginal: input.hexagramOriginal,
    hexagramChanged: input.hexagramChanged,
    changingLines: input.changingLines,
  })

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  try {
    const response = await callDeepSeek({
      model,
      messages,
      temperature: DEFAULT_TEMPERATURE,
      response_format: { type: "json_object" },
    })

    const rawContent = response.choices[0]?.message?.content
    if (!rawContent) {
      return { success: false, error: "API 返回空内容" }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      return {
        success: false,
        error: "AI 返回内容不是有效 JSON",
      }
    }

    const validated = aiReasoningSchema.safeParse(parsed)
    if (!validated.success) {
      return {
        success: false,
        error: "AI 推理结果 schema 校验失败：" + JSON.stringify(validated.error?.issues),
      }
    }

    const data = validated.data
    const interpretation: InterpretationResult = {
      id: uuidv4(),
      type: model === DEEP_MODEL ? "deep" : "default",
      trend: data.trend as Trend,
      analysis: data.analysis,
      conditions: data.conditions,
      timeWindow: data.timeWindow,
      answer: data.answer,
      confidence: data.confidence as ConfidenceLevel,
      model,
      promptVersion: PROMPT_VERSION,
      temperature: DEFAULT_TEMPERATURE,
      rawResponse: rawContent,
      claims: data.claims,
    }

    return { success: true, interpretation }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
