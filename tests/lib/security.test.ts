import { describe, test, expect } from 'vitest'
import {
  validateQuestion,
  sanitizeForPrompt,
  wrapUserInput,
  checkRateLimit,
  validateDateRange,
} from '../../src/lib/security.js'

describe('validateQuestion', () => {
  test('空字符串返回错误', () => {
    const result = validateQuestion('')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('问题不能为空')
  })

  test('超过200字符返回错误', () => {
    const result = validateQuestion('a'.repeat(201))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('问题长度不能超过 200 字')
  })

  test('纯空格返回错误', () => {
    const result = validateQuestion('   ')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  test('包含<script>标签返回错误', () => {
    const result = validateQuestion('<script>alert(1)</script>')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('问题包含不允许的内容')
  })

  test('包含javascript:返回错误', () => {
    const result = validateQuestion('javascript:alert(1)')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('问题包含不允许的内容')
  })

  test('包含onload=返回错误', () => {
    const result = validateQuestion('x onload=alert(1)')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('问题包含不允许的内容')
  })

  test('正常中文问题通过', () => {
    const result = validateQuestion('这次面试能否成功？')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('sanitizeForPrompt', () => {
  test('截断超过500字符', () => {
    const input = 'a'.repeat(600)
    const result = sanitizeForPrompt(input)
    expect(result.length).toBeLessThanOrEqual(500)
  })

  test('移除零宽字符', () => {
    const input = '你好​世界‏！'
    const result = sanitizeForPrompt(input)
    expect(result).toBe('你好世界！')
  })

  test('移除XML标签', () => {
    const input = '<USER_INPUT>恶意内容</USER_INPUT>'
    const result = sanitizeForPrompt(input)
    expect(result).not.toContain('<USER_INPUT>')
    expect(result).not.toContain('</USER_INPUT>')
  })

  test('保留正常标点', () => {
    const input = '你好！这是测试。'
    const result = sanitizeForPrompt(input)
    expect(result).toBe('你好！这是测试。')
  })
})

describe('wrapUserInput', () => {
  test('包裹在<USER_INPUT>标签中', () => {
    const result = wrapUserInput('测试问题')
    expect(result).toContain('<USER_INPUT>')
    expect(result).toContain('</USER_INPUT>')
    expect(result).toContain('测试问题')
  })

  test('先sanitize再包裹', () => {
    const result = wrapUserInput('<USER_INPUT>注入</USER_INPUT>')
    expect(result).toContain('<USER_INPUT>')
    // sanitizeForPrompt 移除了内层的 <USER_INPUT> 标签
    expect(result).not.toContain('<USER_INPUT>注入</USER_INPUT>')
  })
})

describe('checkRateLimit', () => {
  test('间隔不足返回allowed=false', () => {
    const now = Date.now()
    const result = checkRateLimit(now, 2000)
    expect(result.allowed).toBe(false)
    expect(result.waitMs).toBeGreaterThan(0)
  })

  test('间隔足够返回allowed=true', () => {
    const now = Date.now() - 3000
    const result = checkRateLimit(now, 2000)
    expect(result.allowed).toBe(true)
  })

  test('首次调用（lastCallTime=0）返回allowed=true', () => {
    const result = checkRateLimit(0, 2000)
    expect(result.allowed).toBe(true)
  })
})

describe('validateDateRange', () => {
  test('1900年前日期返回错误', () => {
    const result = validateDateRange(new Date('1899-01-01'))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('日期范围应在 1900-2100 年之间')
  })

  test('2100年后日期返回错误', () => {
    const result = validateDateRange(new Date('2101-01-01'))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('日期范围应在 1900-2100 年之间')
  })

  test('有效日期通过', () => {
    const result = validateDateRange(new Date('2026-07-01'))
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('Invalid Date返回错误', () => {
    const result = validateDateRange(new Date('invalid'))
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('无效的日期')
  })
})
