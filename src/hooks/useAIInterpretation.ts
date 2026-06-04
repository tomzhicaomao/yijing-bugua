import { useState, useCallback } from "react"
import { runDoubleCall, type AIProgress } from "../ai/double-call.js"
import type { InterpretationResult, DivinationRecord } from "../types"
import { updateRecord } from "../db/records.js"
import { hasApiKey } from "../lib/api-key.js"

interface UseAIInterpretationReturn {
  progress: AIProgress
  error: string | null
  narrative: string | null
  interpretation: InterpretationResult | null
  hasKey: boolean
  triggerDefault: (record: DivinationRecord) => Promise<void>
  triggerDeep: (record: DivinationRecord) => Promise<void>
}

export function useAIInterpretation(): UseAIInterpretationReturn {
  const [progress, setProgress] = useState<AIProgress>("idle")
  const [error, setError] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null)

  const triggerCall = useCallback(async (record: DivinationRecord, type: "default" | "deep") => {
    if (!hasApiKey()) {
      setError("未配置 API Key")
      setProgress("error")
      return
    }

    setProgress("idle")
    setError(null)

    const result = await runDoubleCall(
      {
        question: record.question,
        hexagramOriginal: record.hexagram.original,
        hexagramChanged: record.hexagram.changed,
        changingLines: record.hexagram.changingLines,
      },
      type,
      {
        onProgress: (p) => setProgress(p),
      },
    )

    if (result.success && result.interpretation) {
      setInterpretation(result.interpretation)
      if (result.narrative) setNarrative(result.narrative)
      if (result.error) setError(result.error)

      // Update the record in IndexedDB with the interpretation
      const updated = {
        ...record,
        interpretations: [...record.interpretations, result.interpretation],
      }
      await updateRecord(updated)
    } else {
      setError(result.error ?? "AI 调用失败")
    }
  }, [])

  return {
    progress,
    error,
    narrative,
    interpretation,
    hasKey: hasApiKey(),
    triggerDefault: useCallback((r: DivinationRecord) => triggerCall(r, "default"), [triggerCall]),
    triggerDeep: useCallback((r: DivinationRecord) => triggerCall(r, "deep"), [triggerCall]),
  }
}
