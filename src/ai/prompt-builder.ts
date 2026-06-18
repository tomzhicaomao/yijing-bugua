import { lookupHexagram, getLineText } from "../engine/hexagram-lookup.js"
import type { InterpretationResult } from "../types"

interface PromptContext {
  question: string
  hexagramOriginal: number
  hexagramChanged: number | null
  changingLines: number[]
  hexagramMutual?: number
}

export function buildReasoningSystemPrompt(): string {
  return "你是一位精通周易的占卜师，遵循周易古占法。你必须严格按照以下规则输出：1. 基于卦辞和爻辞进行判断，不能脱离原文 2. 给出明确的趋势判断：利、不利、或中性 3. 列出至少5个可事后验证的具体判断点 4. 必须引用卦辞或爻辞原文出处 5. 参考互卦分析事情的内在因素 6. 当存在变卦（之卦）时，从之卦角度分析事情的演变方向和最终结果。禁止使用天意、命中注定、吉人天相、大吉大利等空洞表述。你必须只输出JSON，不要输出其他任何文字。"
}

export function buildReasoningUserPrompt(ctx: PromptContext): string {
  const hexagram = lookupHexagram(ctx.hexagramOriginal)
  const changed = ctx.hexagramChanged ? lookupHexagram(ctx.hexagramChanged) : null
  const lineResult = getLineText(ctx.hexagramOriginal, ctx.changingLines)

  let relevantText = "本卦：" + (hexagram?.name ?? "未知") + "(第" + ctx.hexagramOriginal + "卦)\n"
  relevantText += "卦辞：" + (hexagram?.judgment ?? "") + "\n"

  if (changed) {
    relevantText += "变卦（之卦）：" + changed.name + "(第" + ctx.hexagramChanged + "卦)\n"
    relevantText += "之卦含义：变卦即之卦，代表事情发展的方向和最终归宿。\n"
  }

  if (ctx.hexagramMutual) {
    const mutual = lookupHexagram(ctx.hexagramMutual)
    if (mutual) {
      relevantText += "互卦：" + mutual.name + "(第" + ctx.hexagramMutual + "卦)\n"
      relevantText += "互卦含义：互卦反映事情发展的内在因素和隐含条件。\n"
    }
  }

  if (ctx.changingLines.length > 0) {
    relevantText += "动爻：第" + ctx.changingLines.join("、") + "爻\n"
  }

  if (lineResult.type === "lines" && Array.isArray(lineResult.text)) {
    ctx.changingLines.forEach((pos) => {
      const line = hexagram?.lines.find(l => l.position === pos)
      if (line) {
        relevantText += "爻辞(" + line.name + ")：" + line.text + "\n"
      }
    })
  }

  if (lineResult.allMoving) {
    relevantText += "(六爻皆动，本卦与变卦并重)\n"
  }

  return `请根据以下卦象信息，对用户的占问进行推理分析：

【用户问题】
${ctx.question}

【卦象信息】
${relevantText}

请输出如下格式的JSON：
{
  "trend": "利" | "不利" | "中性",
  "analysis": "基于卦象的分析文字",
  "conditions": ["条件1", "条件2", "条件3"],
  "timeWindow": "时间窗口描述",
  "answer": "综合判断结论",
  "confidence": "高" | "中" | "低",
  "claims": [
    {"id": "trend-1", "type": "trend", "text": "趋势判断"},
    {"id": "condition-1", "type": "condition", "text": "条件判断"},
    {"id": "timeWindow-1", "type": "timeWindow", "text": "时间判断"},
    {"id": "advice-1", "type": "advice", "text": "行动建议"},
    {"id": "answer-1", "type": "answer", "text": "结论"}
  ]
}

要求：claims 至少5条，覆盖5种类型。每个claim具体可验证。综合判断明确不含混。引用卦辞或爻辞原文。`
}

export function buildNarrativeSystemPrompt(): string {
  return "你是一位善于沟通的易经解读师。你需要将卦象分析结果转化为清晰易读的解说。规则：1. 用中文 2. 按【趋势判断】【核心条件】【时间窗口与建议】【综合判断】四段输出 3. 必须引用卦辞/爻辞原文出处 4. 禁止使用天意、命中注定、吉人天相、大吉大利等空洞表述 5. 综合判断必须明确 6. 语气平实理性，像一位经验丰富的顾问"
}

export function buildNarrativeUserPrompt(question: string, reasoningJson: InterpretationResult): string {
  return `请将以下推理结果转化为一段清晰的解读文章：

【用户问题】
${question}

【推理结果】
趋势：${reasoningJson.trend}
分析：${reasoningJson.analysis}
核心条件：${reasoningJson.conditions.join("；")}
时间窗口：${reasoningJson.timeWindow}
综合判断：${reasoningJson.answer}
置信度：${reasoningJson.confidence}

请用自然流畅的中文组织成四段式展示。`
}
