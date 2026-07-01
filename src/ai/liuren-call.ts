/**
 * 大六壬 AI 调用
 *
 * 复用现有 AI 管道，为大六壬定制 Prompt
 */

import { callDeepSeek, sleep, backoffDelay, DeepSeekError, type DeepSeekRequest } from './deepseek-client.js';
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, PROMPT_VERSION } from '../lib/constants.js';
import { buildLiurenSystemPrompt, buildLiurenUserPrompt, buildLiurenSystemPromptV2, buildLiurenUserPromptV2 } from './liuren-prompt-builder.js';
import type { LiurenPan } from '../engine/liuren/types.js';
import { analyzeFramework } from '../engine/liuren/framework.js';
import type { ZhanShi } from '../engine/liuren/bifa.js';
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
    // 非首次重试前等待（指数退避 + 抖动）
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1));
    }

    try {
      const req: DeepSeekRequest = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: DEFAULT_TEMPERATURE,
        response_format: { type: 'json_object' },
        max_tokens: 3000,
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

// ==================== V2: 框架层集成版本 ====================

/**
 * 调用 AI 解读大六壬课式（V2）
 *
 * 先进行框架层分析（确定性计算），再调用 AI 进行叙事合成
 *
 * @param pan 完整课式
 * @param question 用户问题
 * @param zhanShi 占事类型
 * @param model AI 模型
 * @param maxRetries 最大重试次数
 */
export async function callLiurenInterpretationV2(
  pan: LiurenPan,
  question: string,
  zhanShi?: ZhanShi,
  model: string = DEFAULT_MODEL,
  maxRetries: number = 3,
): Promise<LiurenCallResult> {
  // 1. 框架层分析（确定性，无AI调用）
  const framework = analyzeFramework(pan, zhanShi);

  // 2. 构建 prompt（结构化输入）
  const systemPrompt = buildLiurenSystemPromptV2();
  const userPrompt = buildLiurenUserPromptV2(pan, question, framework, zhanShi);

  let lastError: string | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      await sleep(backoffDelay(attempt - 1));
    }

    try {
      const req: DeepSeekRequest = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,  // 降低温度，提高一致性
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      };

      const response = await callDeepSeek(req);
      const content = response.choices?.[0]?.message?.content;

      if (!content) {
        lastError = 'AI 返回空内容';
        continue;
      }

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
          promptVersion: `${PROMPT_VERSION}-v2`,
          temperature: 0.3,
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
