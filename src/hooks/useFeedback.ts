import type { FeedbackDetail } from "../types"
import { useState, useCallback } from "react"
import { queryPendingDue, updateRecord } from "../db/records.js"
import { remindLater } from "../lib/feedback-due.js"
import type { DivinationRecord, FeedbackStatus } from "../types"

export function useFeedback() {
  const [pendingRecords, setPendingRecords] = useState<DivinationRecord[]>([])

  const refresh = useCallback(async () => {
    setPendingRecords(await queryPendingDue())
  }, [])

  const submitQuick = useCallback(async (id: string, status: FeedbackStatus) => {
    const r = await (await import("../db/records.js")).getRecordById(id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, status } })
    await refresh()
  }, [refresh])

  const submitRemindLater = useCallback(async (id: string) => {
    const r = await (await import("../db/records.js")).getRecordById(id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, dueAt: remindLater() } })
    await refresh()
  }, [refresh])

  const submitDetail = useCallback(async (id: string, detail: FeedbackDetail) => {
    const r = await (await import("../db/records.js")).getRecordById(id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, detail } })
    await refresh()
  }, [refresh])

  return { pendingRecords, refresh, submitQuick, submitRemindLater, submitDetail }
}