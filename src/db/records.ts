import { supabase, supabaseReady } from '../lib/supabase'
import type { DivinationRecord, Category, FeedbackStatus } from '../types'

/**
 * Convert a local DivinationRecord (camelCase) to a Supabase row (snake_case)
 */
function toSupabaseRow(record: DivinationRecord): Record<string, unknown> {
  return {
    id: record.id,
    schema_version: record.schemaVersion,
    timestamp: record.timestamp,
    question: record.question,
    category: record.category,
    method: record.method,
    before_divination: record.beforeDivination ?? null,
    hexagram: record.hexagram,
    interpretations: record.interpretations,
    feedback: record.feedback,
    duplicate: record.duplicate ?? null,
  }
}

/**
 * Convert a Supabase row (snake_case) back to a local DivinationRecord (camelCase)
 */
function fromSupabaseRow(row: Record<string, unknown>): DivinationRecord {
  return {
    id: row.id as string,
    schemaVersion: (row.schema_version as number) ?? 1,
    timestamp: row.timestamp as string,
    question: row.question as string,
    category: row.category as DivinationRecord['category'],
    method: row.method as DivinationRecord['method'],
    beforeDivination: row.before_divination as DivinationRecord['beforeDivination'],
    hexagram: row.hexagram as DivinationRecord['hexagram'],
    interpretations: (row.interpretations as DivinationRecord['interpretations']) ?? [],
    feedback: row.feedback as DivinationRecord['feedback'],
    duplicate: row.duplicate as DivinationRecord['duplicate'],
  }
}

function checkSupabase() {
  if (!supabaseReady) {
    throw new Error('Supabase 未配置，请检查环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }
}

export async function createRecord(record: DivinationRecord, userId: string): Promise<void> {
  checkSupabase()
  const { error } = await supabase.from('records').insert({
    ...toSupabaseRow(record),
    user_id: userId,
  })
  if (error) {
    throw new Error(`Failed to create record: ${error.message}`)
  }
}

export async function updateRecord(record: DivinationRecord, userId: string): Promise<void> {
  checkSupabase()
  const { error } = await supabase
    .from('records')
    .update(toSupabaseRow(record))
    .eq('id', record.id)
    .eq('user_id', userId)
  if (error) {
    throw new Error(`Failed to update record: ${error.message}`)
  }
}

export async function getRecordById(id: string, userId: string): Promise<DivinationRecord | null> {
  checkSupabase()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to get record: ${error.message}`)
  }
  return fromSupabaseRow(data as Record<string, unknown>)
}

export async function getAllRecords(userId: string): Promise<DivinationRecord[]> {
  checkSupabase()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
  if (error) {
    throw new Error(`Failed to get records: ${error.message}`)
  }
  return (data || []).map(row => fromSupabaseRow(row as Record<string, unknown>))
}

export async function queryByCategory(category: Category, userId: string): Promise<DivinationRecord[]> {
  checkSupabase()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('timestamp', { ascending: false })
  if (error) {
    throw new Error(`Failed to query records: ${error.message}`)
  }
  return (data || []).map(row => fromSupabaseRow(row as Record<string, unknown>))
}

export async function queryPendingDue(userId: string): Promise<DivinationRecord[]> {
  checkSupabase()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('feedback->>status', 'pending')
    .lte('feedback->>dueAt', now)
    .order('timestamp', { ascending: false })
  if (error) {
    throw new Error(`Failed to query pending records: ${error.message}`)
  }
  return (data || []).map(row => fromSupabaseRow(row as Record<string, unknown>))
}

export async function queryByFeedbackStatus(status: FeedbackStatus, userId: string): Promise<DivinationRecord[]> {
  checkSupabase()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('feedback->>status', status)
    .order('timestamp', { ascending: false })
  if (error) {
    throw new Error(`Failed to query records: ${error.message}`)
  }
  return (data || []).map(row => fromSupabaseRow(row as Record<string, unknown>))
}

export async function deleteRecord(id: string, userId: string): Promise<void> {
  checkSupabase()
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) {
    throw new Error(`Failed to delete record: ${error.message}`)
  }
}

export async function clearAll(userId: string): Promise<void> {
  checkSupabase()
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('user_id', userId)
  if (error) {
    throw new Error(`Failed to clear records: ${error.message}`)
  }
}
