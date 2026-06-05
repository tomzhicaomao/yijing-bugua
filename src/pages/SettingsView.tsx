import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useSync } from '../hooks/useSync'
import { getApiKey, setApiKey, removeApiKey } from '../lib/api-key'
import { exportToJSON, exportFilename, importFromJSON } from '../db/export-import.js'
import { SCHEMA_VERSION, PROMPT_VERSION, DEFAULT_MODEL, DEEP_MODEL } from '../lib/constants.js'

export default function SettingsView() {
  const { user, signOut } = useAuth()
  const { syncStatus, lastSyncTime, error: syncError, sync, upload } = useSync()
  const [apiKey, setApiKeyState] = useState(getApiKey() ?? '')
  const [showKey, setShowKey] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      setApiKey(apiKey.trim())
    } else {
      removeApiKey()
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    const json = await exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFilename()
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const result = await importFromJSON(text)
      const parts: string[] = []
      if (result.added > 0) parts.push(`新增 ${result.added} 条`)
      if (result.skipped > 0) parts.push(`跳过 ${result.skipped} 条`)
      if (result.invalid > 0) parts.push(`无效 ${result.invalid} 条`)
      if (result.errors.length > 0) parts.push(result.errors.join('；'))
      setImportResult(parts.join('，') || '无数据')
    }
    input.click()
  }

  return (
    <div className="max-w-lg mx-auto py-6 space-y-8">
      <h2 className="text-xl font-semibold text-ink">设置</h2>

      {/* User info */}
      {user && (
        <div className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-ink">{user.email?.split('@')[0]}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>
            <button onClick={signOut} className="px-4 py-2 text-sm text-vermillion hover:bg-red-50 rounded-lg transition-colors">
              退出登录
            </button>
          </div>
        </div>
      )}

      {/* Sync status */}
      <div className="space-y-3">
        <h3 className="font-medium text-ink-light">云端同步</h3>
        <div className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-ink-light">
                状态: {syncStatus === 'syncing' ? '同步中...' : 
                       syncStatus === 'success' ? '✅ 已同步' :
                       syncStatus === 'error' ? '❌ 同步失败' : '未同步'}
              </p>
              {lastSyncTime && (
                <p className="text-xs text-stone-400 mt-0.5">
                  上次同步: {lastSyncTime.toLocaleString('zh-CN')}
                </p>
              )}
              {syncError && (
                <p className="text-xs text-red-500 mt-0.5">{syncError}</p>
              )}
            </div>
            <button 
              onClick={sync} 
              disabled={syncStatus === 'syncing'}
              className="px-4 py-2 bg-vermillion text-white text-sm rounded-lg hover:bg-vermillion-dark disabled:opacity-50 transition-colors"
            >
              同步
            </button>
          </div>
          <button 
            onClick={upload} 
            disabled={syncStatus === 'syncing'}
            className="w-full px-4 py-2 bg-jade text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            上传本地数据到云端
          </button>
          <p className="text-xs text-stone-400">
            登录时自动同步。上传按钮可将本地数据迁移到云端。
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-ink-light">DeepSeek API Key</h3>
        <div className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm space-y-3">
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              className="flex-1 border border-stone-300 rounded-lg p-2.5 bg-white text-ink placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-vermillion/40 focus:border-vermillion text-sm"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKeyState(e.target.value)}
            />
            <button onClick={() => setShowKey(!showKey)} className="px-3 py-2 text-sm bg-parchment-dark rounded-lg hover:bg-stone-300 text-ink-light transition-colors">
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveKey} className="px-4 py-2 bg-vermillion text-white text-sm rounded-lg hover:bg-vermillion-dark transition-colors">保存</button>
            <button onClick={() => { removeApiKey(); setApiKeyState('') }} className="px-4 py-2 text-sm text-vermillion hover:bg-red-50 rounded-lg transition-colors">删除</button>
            {saved && <span className="text-sm text-jade py-2">已保存</span>}
          </div>
          <p className="text-xs text-stone-400">API Key 登录后会自动同步到云端</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-ink-light">数据备份</h3>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-jade text-white text-sm rounded-lg hover:opacity-90 transition-colors">导出数据 (JSON)</button>
          <button onClick={handleImport} className="px-4 py-2 bg-stone-600 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors">导入数据</button>
        </div>
        {importResult && <div className="text-sm p-3 bg-parchment rounded-lg border border-stone-200 text-ink-light">{importResult}</div>}
      </div>

      <div className="bg-white rounded-lg p-4 border border-stone-200 shadow-sm space-y-1.5 text-sm text-stone-500">
        <h3 className="font-medium text-ink-light">版本信息</h3>
        <p>数据版本: {SCHEMA_VERSION}</p>
        <p>Prompt 版本: {PROMPT_VERSION}</p>
        <p>默认模型: {DEFAULT_MODEL}</p>
        <p>深度分析模型: {DEEP_MODEL}</p>
      </div>
    </div>
  )
}
