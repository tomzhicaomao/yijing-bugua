import { supabase, supabaseReady } from '../lib/supabase'
import type { DivinationRecord, Category, FeedbackStatus } from '../types'

/** 等待指定毫秒 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 指数退避 + 抖动 */
function backoffDelay(attempt: number): number {
  return 1000 * Math.pow(2, attempt) + Math.random() * 500
}

/**
 * 带重试的数据库写入包装器
 * 网络抖动或 Supabase 瞬时故障时自动重试
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1))
    }
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }
  throw lastError
}

/**
 * Convert a local DivinationRecord (camelCase) to a Supabase row (snake_case)
 */
function toSupabaseRow(record: DivinationRecord): Record<string, unknown> {
  const row: Record<string, unknown> = {
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
  // 仅当 liuren 字段有值时才包含（兼容未执行 migration 的数据库）
  if (record.liurenPan) row.liuren_pan = record.liurenPan
  if (record.interpretation) row.interpretation = record.interpretation
  return row
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
    beforeDivination: (row.before_divination as DivinationRecord['beforeDivination']) ?? undefined,
    hexagram: row.hexagram as DivinationRecord['hexagram'],
    interpretations: (row.interpretations as DivinationRecord['interpretations']) ?? [],
    feedback: row.feedback as DivinationRecord['feedback'],
    duplicate: (row.duplicate as DivinationRecord['duplicate']) ?? undefined,
    liurenPan: (row.liuren_pan as DivinationRecord['liurenPan']) ?? undefined,
    interpretation: (row.interpretation as DivinationRecord['interpretation']) ?? undefined,
  }
}

function checkSupabase() {
  if (!supabaseReady) {
    throw new Error('Supabase 未配置，请检查环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  }
}

export async function createRecord(record: DivinationRecord, userId: string): Promise<void> {
  checkSupabase()
  await withRetry(async () => {
    const { error } = await supabase.from('records').insert({
      ...toSupabaseRow(record),
      user_id: userId,
    })
    if (error) {
      throw new Error(`Failed to create record: ${error.message}`)
    }
  })
}

export async function updateRecord(record: DivinationRecord, userId: string): Promise<void> {
  checkSupabase()
  await withRetry(async () => {
    const { error } = await supabase
      .from('records')
      .update(toSupabaseRow(record))
      .eq('id', record.id)
      .eq('user_id', userId)
    if (error) {
      throw new Error(`Failed to update record: ${error.message}`)
    }
  })
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
    if (error.code === 'PGRST116') return null
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
    .order("timestamp", { ascending: false })
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
    .not('feedback', 'is', null)
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

export async function queryByMethod(method: string, userId: string): Promise<DivinationRecord[]> {
  checkSupabase()
  const { data, error } = await supabase
    .from('records')
    .select('*')
    .eq('user_id', userId)
    .eq('method', method)
    .order('timestamp', { ascending: false })
  if (error) {
    throw new Error(`Failed to query records: ${error.message}`)
  }
  return (data || []).map(row => fromSupabaseRow(row as Record<string, unknown>))
}
