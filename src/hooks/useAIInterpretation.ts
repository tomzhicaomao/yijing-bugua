import { useState, useCallback, useRef } from "react"
import { runDoubleCall, type AIProgress } from "../ai/double-call.js"
import type { InterpretationResult, DivinationRecord } from "../types"
import { updateRecord } from "../db/records.js"
import { hasApiKey } from "../lib/api-key.js"
import { useAuth } from "../auth/AuthContext"

interface UseAIInterpretationReturn {
  progress: AIProgress
  error: string | null
  narrative: string | null
  interpretation: InterpretationResult | null
  hasKey: boolean
  triggerDefault: (record: DivinationRecord) => Promise<DivinationRecord | null>
  triggerDeep: (record: DivinationRecord) => Promise<DivinationRecord | null>
}

export function useAIInterpretation(): UseAIInterpretationReturn {
  const { user, hasKey } = useAuth()
  const [progress, setProgress] = useState<AIProgress>("idle")
  const [error, setError] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null)

  // 并发保护：防止重复触发 AI 调用
  const isRunningRef = useRef(false)

  const triggerCall = useCallback(async (record: DivinationRecord, type: "default" | "deep"): Promise<DivinationRecord | null> => {
    // 并发检查：如果已有调用在运行，拒绝
    if (isRunningRef.current) {
      return null
    }

    if (!hasApiKey()) {
      setError("未配置 API Key")
      setProgress("error")
      return null
    }
    if (!user) {
      setError("未登录")
      setProgress("error")
      return null
    }

    isRunningRef.current = true
    setProgress("idle")
    setError(null)

    try {
      const result = await runDoubleCall(
        {
          question: record.question,
          category: record.category,
          hexagramOriginal: record.hexagram.original,
          hexagramChanged: record.hexagram.changed,
          changingLines: record.hexagram.changingLines,
          hexagramMutual: record.hexagram.mutual,
          hexagramCuoGua: record.hexagram.cuoGua,
          hexagramZongGua: record.hexagram.zongGua,
          tiYong: record.hexagram.tiYong,
          timeContext: record.hexagram.timeContext,
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

        // Build the updated record locally
        const updated: DivinationRecord = {
          ...record,
          interpretations: [...record.interpretations, result.interpretation],
        }

        // Save to Supabase
        try {
          await updateRecord(updated, user.id)
        } catch (err) {
          console.error('Failed to save interpretation:', err)
        }

        // Signal done AFTER the DB write (regardless of success/fail)
        setProgress("done")

        // Return the updated record so the caller can update its state immediately
        return updated
      } else {
        setError(result.error ?? "AI 调用失败")
        setProgress("error")
        return null
      }
    } finally {
      isRunningRef.current = false
    }
  }, [user])

  return {
    progress,
    error,
    narrative,
    interpretation,
    hasKey,
    triggerDefault: useCallback((r: DivinationRecord) => triggerCall(r, "default"), [triggerCall]),
    triggerDeep: useCallback((r: DivinationRecord) => triggerCall(r, "deep"), [triggerCall]),
  }
}
