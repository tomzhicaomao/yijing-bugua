import { useState } from 'react'
import { getApiKey, setApiKey, removeApiKey } from '../ai/deepseek-client.js'
import { exportToJSON, exportFilename, importFromJSON } from '../db/export-import.js'
import { SCHEMA_VERSION, PROMPT_VERSION, DEFAULT_MODEL, DEEP_MODEL } from '../lib/constants.js'

export default function SettingsView() {
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
      <h2 className="text-xl font-semibold">设置</h2>
      <div className="space-y-3">
        <h3 className="font-medium">DeepSeek API Key</h3>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKeyState(e.target.value)}
          />
          <button onClick={() => setShowKey(!showKey)} className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
            {showKey ? '隐藏' : '显示'}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveKey} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">保存</button>
          <button onClick={() => { removeApiKey(); setApiKeyState('') }} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">删除</button>
          {saved && <span className="text-sm text-green-600 py-2">已保存</span>}
        </div>
        <p className="text-xs text-gray-400">API Key 仅存储在浏览器 localStorage，不会上传至任何服务器</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">数据备份</h3>
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">导出数据 (JSON)</button>
          <button onClick={handleImport} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">导入数据</button>
        </div>
        {importResult && <div className="text-sm p-3 bg-gray-50 rounded-lg border">{importResult}</div>}
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700">版本信息</h3>
        <p>数据版本: {SCHEMA_VERSION}</p>
        <p>Prompt 版本: {PROMPT_VERSION}</p>
        <p>默认模型: {DEFAULT_MODEL}</p>
        <p>深度分析模型: {DEEP_MODEL}</p>
      </div>
    </div>
  )
}
