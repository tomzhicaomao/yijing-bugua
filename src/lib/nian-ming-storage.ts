/**
 * 年命本地存储 + Supabase 云同步
 * 模式与 api-key.ts 一致
 */
import { supabase, supabaseReady } from './supabase';
import type { NianMing } from '../types/nian-ming';

const STORAGE_KEY = 'liuren-nian-ming';
export const NIAN_MING_CHANGED_EVENT = 'nian-ming-changed';

// ---- localStorage ----

export function getNianMing(): NianMing | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.gan && parsed?.zhi) return parsed as NianMing;
    return null;
  } catch {
    return null;
  }
}

export function setNianMing(nm: NianMing): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nm));
  window.dispatchEvent(new CustomEvent(NIAN_MING_CHANGED_EVENT, { detail: nm }));
}

export function removeNianMing(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(NIAN_MING_CHANGED_EVENT));
}

// ---- Supabase 云同步 ----

export async function saveNianMingToCloud(userId: string, nm: NianMing): Promise<void> {
  if (!supabaseReady) return;
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, nian_ming: nm }, { onConflict: 'user_id' });
  if (error) throw new Error(`保存年命失败: ${error.message}`);
}

export async function loadNianMingFromCloud(userId: string): Promise<NianMing | null> {
  if (!supabaseReady) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('nian_ming')
    .eq('user_id', userId)
    .single();
  if (error || !data?.nian_ming) return null;
  return data.nian_ming as NianMing;
}

export async function removeNianMingFromCloud(userId: string): Promise<void> {
  if (!supabaseReady) return;
  const { error } = await supabase
    .from('user_settings')
    .update({ nian_ming: null })
    .eq('user_id', userId);
  if (error) throw new Error(`删除年命失败: ${error.message}`);
}
