import { getDB, resetDB } from './schema.js'
import type { DivinationRecord, Category, FeedbackStatus } from '../types'

const STORE_NAME = 'records'

export { resetDB }
export { getDB as initDB }

export async function createRecord(record: DivinationRecord): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, record)
}

export async function updateRecord(record: DivinationRecord): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, record)
}

export async function getRecordById(id: string): Promise<DivinationRecord | null> {
  const db = await getDB()
  const record = await db.get(STORE_NAME, id)
  return record ?? null
}

export async function getAllRecords(): Promise<DivinationRecord[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  // Sort newest first
  all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return all
}

export async function queryByCategory(category: Category): Promise<DivinationRecord[]> {
  const db = await getDB()
  const index = db.transaction(STORE_NAME).store.index('category')
  const records = await index.getAll(category)
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return records
}

export async function queryPendingDue(): Promise<DivinationRecord[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  const now = new Date().toISOString()
  return all
    .filter((r) => r.feedback.status === 'pending' && r.feedback.dueAt !== null && r.feedback.dueAt <= now)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function queryByFeedbackStatus(status: FeedbackStatus): Promise<DivinationRecord[]> {
  const db = await getDB()
  const index = db.transaction(STORE_NAME).store.index('feedbackStatus')
  const records = await index.getAll(status)
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return records
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearAll(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
