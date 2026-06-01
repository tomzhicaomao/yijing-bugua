import type { DivinationRecord } from '../types'
import type { DuplicateInfo } from '../types'

/**
 * Check if a question matches an existing record's question (exact match).
 */
export function isDuplicateQuestion(
  question: string,
  records: DivinationRecord[],
  windowHours: number,
): boolean {
  const cutoff = Date.now() - windowHours * 3600000
  return records.some(
    (r) =>
      r.question === question && new Date(r.timestamp).getTime() > cutoff,
  )
}

/**
 * Check for duplicate questions in the last `windowHours` hours.
 * Returns null if no duplicates, or DuplicateInfo if duplicates found.
 */
export function checkDuplicate(
  question: string,
  records: DivinationRecord[],
  windowHours: number,
): DuplicateInfo | null {
  const cutoff = Date.now() - windowHours * 3600000
  const related = records.filter(
    (r) =>
      r.question === question && new Date(r.timestamp).getTime() > cutoff,
  )

  if (related.length === 0) return null

  return {
    countInWindow: related.length,
    relatedRecordIds: related.map((r) => r.id),
  }
}
