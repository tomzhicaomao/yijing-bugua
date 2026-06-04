import { supabase, supabaseReady } from './supabase'
import { getAllRecords, createRecord, updateRecord } from '../db/records.js'
import { getApiKey, setApiKey } from './api-key.js'
import type { DivinationRecord } from '../types'

interface SyncResult {
  uploaded: number
  downloaded: number
  skipped: number
  errors: string[]
}

const NOT_CONFIGURED_RESULT: SyncResult = {
  uploaded: 0, downloaded: 0, skipped: 0,
  errors: ['Supabase 未配置，云同步不可用'],
}

/**
 * Sync local data to cloud on login
 */
export async function syncOnLogin(userId: string): Promise<SyncResult> {
  if (!supabaseReady) return NOT_CONFIGURED_RESULT

  const result: SyncResult = { uploaded: 0, downloaded: 0, skipped: 0, errors: [] }

  try {
    const localRecords = await getAllRecords()

    const { data: cloudRecords, error: fetchError } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      result.errors.push(`Failed to fetch cloud records: ${fetchError.message}`)
      return result
    }

    const cloudMap = new Map<string, DivinationRecord>()
    for (const record of cloudRecords || []) {
      cloudMap.set(record.id, record)
    }

    for (const localRecord of localRecords) {
      const cloudRecord = cloudMap.get(localRecord.id)

      if (!cloudRecord) {
        const { error } = await supabase.from('records').insert({
          ...localRecord,
          user_id: userId,
        })
        if (error) {
          result.errors.push(`Failed to upload record ${localRecord.id}: ${error.message}`)
        } else {
          result.uploaded++
        }
      } else if (new Date(localRecord.timestamp) > new Date(cloudRecord.timestamp)) {
        const { error } = await supabase
          .from('records')
          .update(localRecord)
          .eq('id', localRecord.id)
          .eq('user_id', userId)
        if (error) {
          result.errors.push(`Failed to update record ${localRecord.id}: ${error.message}`)
        } else {
          result.uploaded++
        }
      } else {
        await updateRecord(cloudRecord)
        result.downloaded++
      }
    }

    const localRecordMap = new Map(localRecords.map(r => [r.id, r]))
    for (const cloudRecord of cloudRecords || []) {
      if (!localRecordMap.has(cloudRecord.id)) {
        await createRecord(cloudRecord)
        result.downloaded++
      }
    }

    const localApiKey = getApiKey()
    if (localApiKey) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          api_key: localApiKey,
        }, { onConflict: 'user_id' })
      if (error) {
        result.errors.push(`Failed to sync API key: ${error.message}`)
      }
    } else {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('api_key')
        .eq('user_id', userId)
        .single()

      if (settings?.api_key) {
        setApiKey(settings.api_key)
      }
    }

  } catch (error) {
    result.errors.push(`Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}

/**
 * Upload all local records to cloud (manual migration)
 */
export async function uploadLocalData(userId: string): Promise<SyncResult> {
  if (!supabaseReady) return NOT_CONFIGURED_RESULT

  const result: SyncResult = { uploaded: 0, downloaded: 0, skipped: 0, errors: [] }

  try {
    const localRecords = await getAllRecords()

    for (const record of localRecords) {
      const { error } = await supabase.from('records').upsert({
        ...record,
        user_id: userId,
      }, { onConflict: 'id' })

      if (error) {
        result.errors.push(`Failed to upload record ${record.id}: ${error.message}`)
      } else {
        result.uploaded++
      }
    }

    const localApiKey = getApiKey()
    if (localApiKey) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          api_key: localApiKey,
        }, { onConflict: 'user_id' })
      if (error) {
        result.errors.push(`Failed to sync API key: ${error.message}`)
      }
    }

  } catch (error) {
    result.errors.push(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return result
}
