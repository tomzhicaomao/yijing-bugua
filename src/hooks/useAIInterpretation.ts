import { useState, useCallback, useEffect } from "react"
import { runDoubleCall, type AIProgress } from "../ai/double-call.js"
import type { InterpretationResult, DivinationRecord } from "../types"
import { updateRecord } from "../db/records.js"
import { hasApiKey, getApiKey } from "../lib/api-key.js"
import { useAuth } from "../auth/AuthContext"

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
  const { user } = useAuth()
  const [progress, setProgress] = useState<AIProgress>("idle")
  const [error, setError] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null)
  // Reactive API key state — syncs with localStorage changes
  const [hasKey, setHasKey] = useState(() => hasApiKey())

  useEffect(() => {
    // Re-check on mount in case localStorage was populated after initial render
    setHasKey(hasApiKey())
    // Listen for storage events (fires in other tabs) and custom api-key-changed events
    const onKeyChange = () => setHasKey(hasApiKey())
    window.addEventListener("api-key-changed", onKeyChange)
    return () => window.removeEventListener("api-key-changed", onKeyChange)
  }, [])

  const triggerCall = useCallback(async (record: DivinationRecord, type: "default" | "deep") => {
    if (!hasApiKey()) {
      setError("未配置 API Key")
      setProgress("error")
      return
    }
    if (!user) {
      setError("未登录")
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
        hexagramMutual: record.hexagram.mutual,
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

      // Update the record in Supabase with the interpretation
      const updated = {
        ...record,
        interpretations: [...record.interpretations, result.interpretation],
      }
      await updateRecord(updated, user.id)

      // Signal "done" only AFTER the DB write has completed
      // so ResultView's reload effect fetches the updated record
      setProgress("done")
    } else {
      setError(result.error ?? "AI 调用失败")
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
