import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getApiKey, setApiKey, removeApiKey, saveApiKeyToCloud, removeApiKeyFromCloud } from '../lib/api-key'
import { exportToJSON, exportFilename, importFromJSON } from '../db/export-import.js'
import { SCHEMA_VERSION, PROMPT_VERSION, DEFAULT_MODEL, DEEP_MODEL } from '../lib/constants.js'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function SettingsView() {
  const { user, signOut } = useAuth()
  const [apiKey, setApiKeyState] = useState(getApiKey() ?? '')
  const [showKey, setShowKey] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSaveKey = async () => {
    if (!user) return
    if (apiKey.trim()) {
      setApiKey(apiKey.trim())
      await saveApiKeyToCloud(user.id, apiKey.trim())
    } else {
      removeApiKey()
      await removeApiKeyFromCloud(user.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    if (!user) return
    const json = await exportToJSON(user.id)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFilename()
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    if (!user) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const text = await file.text()
      const result = await importFromJSON(text, user.id)
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
    <div className="min-h-screen bg-nothing-bg text-nothing-text-primary">
      {/* 导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-white/40 hover:text-gold transition-colors">← 返回</Link>
          <span className="font-display text-lg tracking-[0.2em] text-gold">设置</span>
          <div className="w-10" />
        </div>
      </nav>

      {/* 主内容 */}
      <main className="pt-16 pb-24 px-6">
        <div className="max-w-md mx-auto py-8 space-y-6">
          {/* 用户信息 */}
          {user && (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium tracking-wide">{user.email?.split('@')[0]}</p>
                  <p className="text-sm text-white/40">{user.email}</p>
                </div>
                <Button variant="ghost" onClick={signOut} className="py-2 px-4 text-sm">
                  退出登录
                </Button>
              </div>
            </GlassCard>
          )}

          {/* API Key */}
          <GlassCard className="p-5">
            <h3 className="text-sm text-white/40 mb-4 tracking-wide">DeepSeek API Key</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" onClick={() => setShowKey(!showKey)} className="px-4 py-2 text-sm">
                  {showKey ? '隐藏' : '显示'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveKey} className="flex-1 py-2 text-sm">保存</Button>
                <Button variant="ghost" onClick={async () => { if (user) { await removeApiKeyFromCloud(user.id) }; removeApiKey(); setApiKeyState('') }} className="py-2 px-4 text-sm">
                  删除
                </Button>
              </div>
              {saved && <p className="text-sm text-gold">已保存</p>}
            </div>
          </GlassCard>

          {/* 数据备份 */}
          <GlassCard className="p-5">
            <h3 className="text-sm text-white/40 mb-4 tracking-wide">数据备份</h3>
            <div className="flex gap-3">
              <Button onClick={handleExport} className="flex-1 py-2 text-sm">导出数据</Button>
              <Button variant="ghost" onClick={handleImport} className="flex-1 py-2 text-sm">导入数据</Button>
            </div>
            {importResult && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg text-sm text-white/60">
                {importResult}
              </div>
            )}
          </GlassCard>

          {/* 版本信息 */}
          <GlassCard className="p-5">
            <h3 className="text-sm text-white/40 mb-4 tracking-wide">版本信息</h3>
            <div className="text-sm text-white/40 space-y-2">
              <p>数据版本: {SCHEMA_VERSION}</p>
              <p>Prompt 版本: {PROMPT_VERSION}</p>
              <p>默认模型: {DEFAULT_MODEL}</p>
              <p>深度分析模型: {DEEP_MODEL}</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  )
}
