import { callDeepSeek, type DeepSeekMessage } from "./deepseek-client.js"
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "../lib/constants.js"
import { buildNarrativeSystemPrompt, buildNarrativeUserPrompt } from "./prompt-builder.js"
import type { InterpretationResult } from "../types"

export interface NarrativeCallResult {
  success: boolean
  narrative?: string
  error?: string
}

export async function callNarrative(
  question: string,
  reasoning: InterpretationResult,
  model: string = DEFAULT_MODEL,
  maxRetries: number = 1,
): Promise<NarrativeCallResult> {
  const systemPrompt = buildNarrativeSystemPrompt()
  const userPrompt = buildNarrativeUserPrompt(question, reasoning)

  const messages: DeepSeekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]

  let lastError: string | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await callDeepSeek({
        model,
        messages,
        temperature: DEFAULT_TEMPERATURE,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        lastError = "API 返回空内容"
        continue
      }

      return { success: true, narrative: content }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }
  }

  return { success: false, error: lastError }
}
