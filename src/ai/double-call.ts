import { callReasoning } from "./reasoning-call.js"
import { callNarrative } from "./narrative-call.js"
import { DEFAULT_MODEL, DEEP_MODEL } from "../lib/constants.js"
import type { InterpretationResult, TiYongRelation, TimeContext, Category } from "../types"
import type { NajiaResult } from "../engine/najia.js"
import { hasApiKey } from "../lib/api-key.js"

export type AIProgress = "idle" | "reasoning" | "narrative" | "done" | "error"

export interface DoubleCallResult {
  success: boolean
  interpretation?: InterpretationResult
  narrative?: string
  progress: AIProgress
  error?: string
}

export interface DoubleCallCallbacks {
  onProgress: (progress: AIProgress) => void
}

export interface DoubleCallInput {
  question: string
  category?: Category
  hexagramOriginal: number
  hexagramChanged: number | null
  changingLines: number[]
  hexagramMutual?: number
  // Phase 1: 结构化断卦元数据
  hexagramCuoGua?: number
  hexagramZongGua?: number
  tiYong?: TiYongRelation
  timeContext?: TimeContext
  // Phase 2: 纳甲数据
  najia?: NajiaResult
}

export async function runDoubleCall(
  input: DoubleCallInput,
  type: "default" | "deep",
  callbacks: DoubleCallCallbacks,
): Promise<DoubleCallResult> {
  if (!hasApiKey()) {
    return { success: false, progress: "error", error: "未配置 API Key" }
  }

  const model = type === "deep" ? DEEP_MODEL : DEFAULT_MODEL

  callbacks.onProgress("reasoning")
  const reasoningResult = await callReasoning(input, model)

  if (!reasoningResult.success || !reasoningResult.interpretation) {
    callbacks.onProgress("error")
    return { success: false, progress: "error", error: reasoningResult.error }
  }

  callbacks.onProgress("narrative")
  const narrativeResult = await callNarrative(
    input.question,
    reasoningResult.interpretation,
    model,
  )

  if (!narrativeResult.success) {
    return {
      success: true,
      interpretation: reasoningResult.interpretation,
      narrative: undefined,
      progress: "done",
      error: "叙事调用失败，显示推理结果",
    }
  }

  return {
    success: true,
    interpretation: reasoningResult.interpretation,
    narrative: narrativeResult.narrative,
    progress: "done",
  }
}
