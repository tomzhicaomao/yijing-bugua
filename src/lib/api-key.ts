import { supabase, supabaseReady } from './supabase'

const API_KEY_STORAGE_KEY = 'deepseek-api-key'

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE_KEY)
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE_KEY, key)
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE_KEY)
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

/**
 * 保存 API Key 到云端
 */
export async function saveApiKeyToCloud(userId: string, apiKey: string): Promise<void> {
  if (!supabaseReady) return
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      api_key: apiKey,
    }, { onConflict: 'user_id' })
  if (error) {
    console.error('Failed to save API key to cloud:', error.message)
  }
}

/**
 * 从云端加载 API Key
 */
export async function loadApiKeyFromCloud(userId: string): Promise<string | null> {
  if (!supabaseReady) return null
  const { data, error } = await supabase
    .from('user_settings')
    .select('api_key')
    .eq('user_id', userId)
    .single()
  if (error || !data?.api_key) return null
  return data.api_key
}

/**
 * 删除云端 API Key
 */
export async function removeApiKeyFromCloud(userId: string): Promise<void> {
  if (!supabaseReady) return
  const { error } = await supabase
    .from('user_settings')
    .update({ api_key: null })
    .eq('user_id', userId)
  if (error) {
    console.error('Failed to remove API key from cloud:', error.message)
  }
}
