import { getApiKey } from '../lib/api-key.js'

/** 最小调用间隔（毫秒）— 防止 API 滥用 */
const MIN_CALL_INTERVAL_MS = 3000
let lastCallTime = 0

/** 等待指定毫秒 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 计算退避时间（指数 + 随机抖动） */
export function backoffDelay(attempt: number, baseMs: number = 1000): number {
  const exponential = baseMs * Math.pow(2, attempt)
  const jitter = Math.random() * baseMs
  return exponential + jitter
}

// 开发环境使用 Vite 代理，生产环境使用 Vercel serverless function
const isDev = import.meta.env.DEV
const DEEPSEEK_BASE = isDev
  ? '/api/deepseek/chat/completions'
  : '/api/deepseek'

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature?: number
  response_format?: { type: 'json_object' }
  max_tokens?: number
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class DeepSeekError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'DeepSeekError'
    this.status = status
  }
}

export async function callDeepSeek(req: DeepSeekRequest): Promise<DeepSeekResponse> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new DeepSeekError('未配置 API Key，请在设置页面配置')
  }

  // 速率限制：确保两次调用之间有最小间隔
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < MIN_CALL_INTERVAL_MS) {
    await sleep(MIN_CALL_INTERVAL_MS - elapsed)
  }
  lastCallTime = Date.now()

  const response = await fetch(DEEPSEEK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(req),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new DeepSeekError(
      `API 调用失败 (${response.status}): ${text}`,
      response.status,
    )
  }

  return response.json()
}
