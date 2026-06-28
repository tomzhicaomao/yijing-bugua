/**
 * 大六壬安全检查
 *
 * 输入校验、XSS 防护、Prompt 注入防护
 */

/**
 * 输入安全检查结果
 */
export interface SecurityCheckResult {
  valid: boolean;
  errors: string[];
}

/**
 * 检查问题输入安全性
 *
 * @param question 用户输入的问题
 * @returns 检查结果
 */
export function validateQuestion(question: string): SecurityCheckResult {
  const errors: string[] = [];

  // 1. 长度检查
  const trimmed = question.trim();
  if (trimmed.length < 1) {
    errors.push('问题不能为空');
  }
  if (trimmed.length > 200) {
    errors.push('问题长度不能超过 200 字');
  }

  // 2. 纯空白检查
  if (/^\s*$/.test(question)) {
    errors.push('问题不能为纯空白');
  }

  // 3. XSS 基础检查
  if (/<script|javascript:|on\w+\s*=/i.test(question)) {
    errors.push('问题包含不允许的内容');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检查日期范围安全性
 *
 * @param date 日期
 * @returns 检查结果
 */
export function validateDateRange(date: Date): SecurityCheckResult {
  const errors: string[] = [];
  const year = date.getFullYear();

  if (year < 1900 || year > 2100) {
    errors.push('日期范围应在 1900-2100 年之间');
  }

  if (isNaN(date.getTime())) {
    errors.push('无效的日期');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Prompt 注入防护
 *
 * 清理用户输入，移除可能的 Prompt 注入内容
 *
 * @param input 用户输入
 * @returns 清理后的输入
 */
export function sanitizeForPrompt(input: string): string {
  // 移除可能的 Prompt 注入标记
  let cleaned = input;

  // 移除系统提示词标记
  cleaned = cleaned.replace(/\[system\]|\[\/system\]/gi, '');
  cleaned = cleaned.replace(/\[user\]|\[\/user\]/gi, '');
  cleaned = cleaned.replace(/\[assistant\]|\[\/assistant\]/gi, '');

  // 移除常见的 Prompt 注入模式
  cleaned = cleaned.replace(/ignore previous instructions/gi, '');
  cleaned = cleaned.replace(/you are now/gi, '');
  cleaned = cleaned.replace(/new instructions/gi, '');

  // 限制长度
  if (cleaned.length > 200) {
    cleaned = cleaned.substring(0, 200);
  }

  return cleaned.trim();
}

/**
 * 频率限制检查（前端）
 *
 * @param lastCallTime 上次调用时间戳
 * @param minIntervalMs 最小间隔（毫秒）
 * @returns 是否允许调用
 */
export function checkRateLimit(
  lastCallTime: number,
  minIntervalMs: number = 2000,
): { allowed: boolean; waitMs?: number } {
  const now = Date.now();
  const elapsed = now - lastCallTime;

  if (elapsed < minIntervalMs) {
    return {
      allowed: false,
      waitMs: minIntervalMs - elapsed,
    };
  }

  return { allowed: true };
}
