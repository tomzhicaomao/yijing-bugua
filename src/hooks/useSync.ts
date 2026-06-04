import { useState, useCallback } from 'react'
import { syncOnLogin, uploadLocalData } from '../lib/sync'
import { useAuth } from '../auth/AuthContext'

interface UseSyncReturn {
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
  lastSyncTime: Date | null
  error: string | null
  sync: () => Promise<void>
  upload: () => Promise<void>
}

export function useSync(): UseSyncReturn {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const sync = useCallback(async () => {
    if (!user) {
      setError('请先登录')
      return
    }

    setSyncStatus('syncing')
    setError(null)

    try {
      const result = await syncOnLogin(user.id)
      
      if (result.errors.length > 0) {
        setError(result.errors.join(', '))
        setSyncStatus('error')
      } else {
        setSyncStatus('success')
        setLastSyncTime(new Date())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '同步失败')
      setSyncStatus('error')
    }
  }, [user])

  const upload = useCallback(async () => {
    if (!user) {
      setError('请先登录')
      return
    }

    setSyncStatus('syncing')
    setError(null)

    try {
      const result = await uploadLocalData(user.id)
      
      if (result.errors.length > 0) {
        setError(result.errors.join(', '))
        setSyncStatus('error')
      } else {
        setSyncStatus('success')
        setLastSyncTime(new Date())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
      setSyncStatus('error')
    }
  }, [user])

  return {
    syncStatus,
    lastSyncTime,
    error,
    sync,
    upload,
  }
}
