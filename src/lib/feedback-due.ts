import type { Category } from '../types'
import { FEEDBACK_DUE_DAYS } from './constants.js'

/**
 * Calculate default feedback due date from a given timestamp and category.
 * Returns ISO string, or null if reminders are disabled.
 */
export function calculateDefaultDueAt(
  timestamp: string,
  category: Category,
  enableReminder: boolean = true,
): string | null {
  if (!enableReminder) return null

  const days = FEEDBACK_DUE_DAYS[category] ?? 7
  const dueDate = new Date(timestamp)
  dueDate.setDate(dueDate.getDate() + days)
  return dueDate.toISOString()
}

/**
 * Update dueAt to "remind later" — adds 3 days from now.
 */
export function remindLater(): string {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toISOString()
}

/**
 * Set dueAt to null to disable reminders.
 */
export function disableReminder(): null {
  return null
}
