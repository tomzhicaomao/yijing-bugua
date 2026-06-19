import type { FeedbackDetail } from "../types"
import { useState, useCallback } from "react"
import { queryPendingDue, updateRecord, getRecordById } from "../db/records.js"
import { remindLater } from "../lib/feedback-due.js"
import { useAuth } from "../auth/AuthContext"
import type { DivinationRecord, FeedbackStatus } from "../types"

export function useFeedback() {
  const { user } = useAuth()
  const [pendingRecords, setPendingRecords] = useState<DivinationRecord[]>([])

  const refresh = useCallback(async () => {
    if (!user) return
    setPendingRecords(await queryPendingDue(user.id))
  }, [user])

  const submitQuick = useCallback(async (id: string, status: FeedbackStatus) => {
    if (!user) return
    const r = await getRecordById(id, user.id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, status } }, user.id)
    await refresh()
  }, [refresh, user])

  const submitRemindLater = useCallback(async (id: string) => {
    if (!user) return
    const r = await getRecordById(id, user.id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, dueAt: remindLater() } }, user.id)
    await refresh()
  }, [refresh, user])

  const submitDetail = useCallback(async (id: string, detail: FeedbackDetail) => {
    if (!user) return
    const r = await getRecordById(id, user.id)
    if (!r) return
    await updateRecord({ ...r, feedback: { ...r.feedback, detail } }, user.id)
    await refresh()
  }, [refresh, user])

  return { pendingRecords, refresh, submitQuick, submitRemindLater, submitDetail }
}
