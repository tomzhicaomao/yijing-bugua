import { describe, it, expect } from 'vitest'
import { buildReasoningSystemPrompt, buildReasoningUserPrompt, buildNarrativeSystemPrompt, buildNarrativeUserPrompt } from '../../src/ai/prompt-builder.js'
import type { PromptContext } from '../../src/ai/prompt-builder.js'
import type { TiYongRelation, TimeContext } from '../../src/types'
import type { NajiaResult } from '../../src/engine/najia.js'

const base: PromptContext = { question: '工作运势？', category: '工作', hexagramOriginal: 1, hexagramChanged: null, changingLines: [] }
const tiYong: TiYongRelation = { tiElement: '金', yongElement: '金', relation: 'bihe', direction: 'ti-yong-bihe', interpretation: '体用皆金：顺遂和谐' }
const timeCtx: TimeContext = { yearPillar: '甲辰', monthZhi: '午', dayPillar: '丙寅', dayStem: '丙', dayZhi: '寅', season: '夏', monthWuxing: '火', wangElements: ['火', '土'] }
const najia: NajiaResult = {
  lines: [
    { position: 1, ganzhi: '甲子', liuQin: '子孙', isShiYao: false, isYingYao: false, wangShuai: '旺', isYongShen: false, chenWuXing: '水' },
    { position: 2, ganzhi: '甲寅', liuQin: '妻财', isShiYao: false, isYingYao: false, wangShuai: '相', isYongShen: false, chenWuXing: '木' },
    { position: 3, ganzhi: '甲辰', liuQin: '父母', isShiYao: false, isYingYao: true, wangShuai: '休', isYongShen: false, chenWuXing: '土' },
    { position: 4, ganzhi: '甲午', liuQin: '官鬼', isShiYao: false, isYingYao: false, wangShuai: '死', isYongShen: true, chenWuXing: '火' },
    { position: 5, ganzhi: '甲申', liuQin: '兄弟', isShiYao: false, isYingYao: false, wangShuai: '囚', isYongShen: false, chenWuXing: '金' },
    { position: 6, ganzhi: '甲戌', liuQin: '父母', isShiYao: true, isYingYao: false, wangShuai: '休', isYongShen: false, chenWuXing: '土' },
  ],
  gongName: '乾宫', gongWuxing: '金',
  yongShen: { position: 4, ganzhi: '甲午', liuQin: '官鬼', isShiYao: false, isYingYao: false, wangShuai: '死', isYongShen: true, chenWuXing: '火' },
  yongShenStatus: '得月建旺气',
  shiYao: { position: 6, ganzhi: '甲戌', liuQin: '父母', isShiYao: true, isYingYao: false, wangShuai: '休', isYongShen: false, chenWuXing: '土' },
  yingYao: { position: 3, ganzhi: '甲辰', liuQin: '父母', isShiYao: false, isYingYao: true, wangShuai: '休', isYongShen: false, chenWuXing: '土' },
}

describe('buildReasoningSystemPrompt', () => {
  const p = buildReasoningSystemPrompt()
  it('包含全部6个Step', () => { for (let i = 1; i <= 6; i++) expect(p).toContain(`Step ${i}`) })
  it('要求JSON输出', () => expect(p).toContain('JSON'))
  it('体用/旺衰/综错各步骤', () => { expect(p).toContain('体用'); expect(p).toContain('旺衰'); expect(p).toContain('综错') })
})

describe('buildReasoningUserPrompt', () => {
  it('基础输出含各区块', () => {
    const p = buildReasoningUserPrompt(base)
    expect(p).toContain('【卦象数据】'); expect(p).toContain('【原文引用】'); expect(p).toContain('【用户问题】')
    expect(p).toContain('乾'); expect(p).toContain('工作运势')
  })
  it('无动爻含彖传', () => expect(buildReasoningUserPrompt(base)).toContain('彖传'))
  it('有动爻含爻辞', () => {
    const p = buildReasoningUserPrompt({ ...base, changingLines: [1, 2] })
    expect(p).toContain('初九爻辞'); expect(p).toContain('九二爻辞')
  })
  it('变卦信息', () => { const p = buildReasoningUserPrompt({ ...base, hexagramChanged: 44 }); expect(p).toContain('姤') })
  it('互卦信息', () => { const p = buildReasoningUserPrompt({ ...base, hexagramMutual: 1 }); expect(p).toContain('互卦') })
  it('体用信息', () => { const p = buildReasoningUserPrompt({ ...base, tiYong }); expect(p).toContain('体用'); expect(p).toContain('金') })
  it('时间上下文', () => { const p = buildReasoningUserPrompt({ ...base, timeContext: timeCtx }); expect(p).toContain('月建'); expect(p).toContain('午月') })
  it('错卦综卦', () => {
    const p = buildReasoningUserPrompt({ ...base, hexagramCuoGua: 2, hexagramZongGua: 1 })
    expect(p).toContain('错卦'); expect(p).toContain('综卦')
  })
  it('纳甲信息块', () => {
    const p = buildReasoningUserPrompt({ ...base, najia, timeContext: timeCtx })
    expect(p).toContain('【纳甲信息】'); expect(p).toContain('乾宫'); expect(p).toContain('世爻'); expect(p).toContain('用神')
  })
  it('无 timeContext 时无纳甲块', () => { expect(buildReasoningUserPrompt({ ...base, najia })).not.toContain('【纳甲信息】') })
  it('无额外数据不崩溃', () => { expect(() => buildReasoningUserPrompt(base)).not.toThrow() })
})

describe('buildNarrative', () => {
  it('SystemPrompt含四段', () => {
    const p = buildNarrativeSystemPrompt()
    expect(p).toContain('趋势判断'); expect(p).toContain('核心条件'); expect(p).toContain('时间窗口'); expect(p).toContain('综合判断')
  })
  it('UserPrompt含推理', () => {
    const p = buildNarrativeUserPrompt('问', { id: '1', type: 'default', trend: '利', analysis: '分析', conditions: ['c1'], timeWindow: '3月', answer: '结论', confidence: '高', model: 'm', promptVersion: '1', claims: [] })
    expect(p).toContain('利'); expect(p).toContain('分析'); expect(p).toContain('3月')
  })
})
