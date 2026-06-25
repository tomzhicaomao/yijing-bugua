import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerPromptVersion, getActivePromptVersion, getPromptVersion,
  setActiveVersion, updateVersionMetrics, compareVersions, listVersions, resetVersions,
} from '../../src/engine/prompt-optimizer.js'

const v1 = { version: '1.0', releasedAt: '2026-01-01', changelog: '初始', systemPrompt: 's1', userPromptTemplate: 'u1' }
const v2 = { version: '1.1', releasedAt: '2026-06-01', changelog: '增强', systemPrompt: 's2', userPromptTemplate: 'u2' }

beforeEach(() => resetVersions())

describe('prompt-optimizer', () => {
  it('注册后取最新', () => { registerPromptVersion(v1); registerPromptVersion(v2); expect(getActivePromptVersion()?.version).toBe('1.1') })
  it('按版本查找', () => { registerPromptVersion(v1); expect(getPromptVersion('1.0')?.changelog).toBe('初始'); expect(getPromptVersion('9.9')).toBeNull() })
  it('切换版本', () => { registerPromptVersion(v1); registerPromptVersion(v2); expect(setActiveVersion('1.0')).toBe(true); expect(getActivePromptVersion()?.version).toBe('1.0'); expect(setActiveVersion('9.9')).toBe(false) })
  it('更新指标', () => {
    registerPromptVersion(v1)
    expect(updateVersionMetrics('1.0', { totalCalls: 100, averageAccuracy: 0.75, byClaimType: {} as any, byCategory: {} as any })).toBe(true)
    expect(getActivePromptVersion()?.metrics?.totalCalls).toBe(100)
  })
  it('版本对比', () => {
    registerPromptVersion(v1); registerPromptVersion(v2)
    updateVersionMetrics('1.0', { totalCalls: 50, averageAccuracy: 0.6, byClaimType: {} as any, byCategory: {} as any })
    updateVersionMetrics('1.1', { totalCalls: 50, averageAccuracy: 0.8, byClaimType: {} as any, byCategory: {} as any })
    expect(compareVersions('1.0', '1.1')?.accuracyDelta).toBeCloseTo(0.2)
  })
  it('listVersions', () => { registerPromptVersion(v1); registerPromptVersion(v2); expect(listVersions()).toHaveLength(2) })
})
