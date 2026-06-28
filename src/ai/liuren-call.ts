/**
 * 大六壬 AI 调用
 *
 * 复用现有 AI 管道，为大六壬定制 Prompt
 */

import { callDeepSeek, type DeepSeekMessage } from './deepseek-client.js';
import { DEFAULT_MODEL, DEEP_MODEL, DEFAULT_TEMPERATURE, PROMPT_VERSION } from '../lib/constants.js';
import { aiReasoningSchema } from '../lib/schemas.js';
import { buildLiurenSystemPrompt, buildLiurenUserPrompt } from './liuren-prompt-builder.js';
import type { LiurenPan } from '../engine/liuren/types.js';
import type { InterpretationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface LiurenCallResult {
  success: boolean;
  interpretation?: InterpretationResult;
  error?: string;
}

/**
 * 调用 AI 解读大六壬课式
 *
 * @param pan 完整课式
 * @param question 用户问题
 * @param model 模型名称
 * @param maxRetries 最大重试次数
 * @returns 解读结果
 */
export async function callLiurenInterpretation(
  pan: LiurenPan,
  question: string,
  model: string = DEFAULT_MODEL,
  maxRetries: number = 3,
): Promise<LiurenCallResult> {
  const systemPrompt = buildLiurenSystemPrompt();
  const userPrompt = buildLiurenUserPrompt(pan, question);

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await callDeepSeek(messages, model, DEFAULT_TEMPERATURE);

      if (!result.success || !result.content) {
        lastError = result.error || 'AI 调用失败';
        continue;
      }

      // 解析 JSON 响应
      const parsed = parseAIResponse(result.content);
      if (!parsed) {
        lastError = 'AI 响应格式不符合预期';
        continue;
      }

      return {
        success: true,
        interpretation: {
          id: uuidv4(),
          type: 'default',
          trend: parsed.trend,
          analysis: parsed.analysis,
          conditions: parsed.conditions,
          timeWindow: parsed.timeWindow,
          answer: parsed.answer,
          confidence: parsed.confidence,
          model,
          promptVersion: PROMPT_VERSION,
          temperature: DEFAULT_TEMPERATURE,
          rawResponse: result.content,
          claims: parsed.claims,
        },
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : '未知错误';
    }
  }

  return {
    success: false,
    error: lastError || 'AI 调用失败（已重试）',
  };
}

/**
 * 解析 AI 响应 JSON
 */
function parseAIResponse(content: string): {
  trend: InterpretationResult['trend'];
  analysis: string;
  conditions: string[];
  timeWindow: string;
  answer: string;
  confidence: InterpretationResult['confidence'];
  claims: InterpretationResult['claims'];
} | null {
  try {
    // 尝试提取 JSON（可能被包裹在 ```json ``` 中）
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    // 也可能直接是 JSON
    if (jsonStr.startsWith('{')) {
      const parsed = JSON.parse(jsonStr);

      // 验证必要字段
      if (!parsed.trend || !parsed.analysis || !parsed.answer) {
        return null;
      }

      // 确保 claims 有至少一个
      const claims = Array.isArray(parsed.claims) && parsed.claims.length > 0
        ? parsed.claims
        : [{ id: 'claim-1', type: 'answer', text: parsed.answer }];

      return {
        trend: parsed.trend,
        analysis: parsed.analysis,
        conditions: Array.isArray(parsed.conditions) ? parsed.conditions : [],
        timeWindow: parsed.timeWindow || '未明确',
        answer: parsed.answer,
        confidence: parsed.confidence || '中',
        claims,
      };
    }

    return null;
  } catch {
    return null;
  }
}
