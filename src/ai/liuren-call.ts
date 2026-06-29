/**
 * 大六壬 AI 调用
 *
 * 复用现有 AI 管道，为大六壬定制 Prompt
 */

import { callDeepSeek, DeepSeekError, type DeepSeekRequest } from './deepseek-client.js';
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, PROMPT_VERSION } from '../lib/constants.js';
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
 * @param topic 问事类型：general/ganqing/shiye/caifu
 * @param model AI 模型
 * @param maxRetries 最大重试次数
 */
export async function callLiurenInterpretation(
  pan: LiurenPan,
  question: string,
  topic?: string,
  model: string = DEFAULT_MODEL,
  maxRetries: number = 3,
): Promise<LiurenCallResult> {
  const systemPrompt = buildLiurenSystemPrompt(topic);
  const userPrompt = buildLiurenUserPrompt(pan, question);

  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const req: DeepSeekRequest = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: DEFAULT_TEMPERATURE,
        response_format: { type: 'json_object' },
      };

      const response = await callDeepSeek(req);
      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        lastError = 'AI 返回空内容';
        continue;
      }

      // 解析 JSON 响应
      const parsed = parseAIResponse(content);
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
          rawResponse: content,
          claims: parsed.claims,
        },
      };
    } catch (err) {
      if (err instanceof DeepSeekError) {
        lastError = err.message;
      } else {
        lastError = err instanceof Error ? err.message : '未知错误';
      }
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
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    if (jsonStr.startsWith('{')) {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.trend || !parsed.analysis || !parsed.answer) {
        return null;
      }

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
