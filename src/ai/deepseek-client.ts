const DEEPSEEK_BASE = 'https://api.deepseek.com/chat/completions'

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

export function getApiKey(): string | null {
  return localStorage.getItem('deepseek-api-key')
}

export function setApiKey(key: string): void {
  localStorage.setItem('deepseek-api-key', key)
}

export function removeApiKey(): void {
  localStorage.removeItem('deepseek-api-key')
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

export async function callDeepSeek(req: DeepSeekRequest): Promise<DeepSeekResponse> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new DeepSeekError('未配置 API Key，请在设置页面配置')
  }

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
