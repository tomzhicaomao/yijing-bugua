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
 * 结构化隔离策略：
 * 1. 用 XML 风格分隔符包裹用户输入，明确边界
 * 2. 在 system prompt 中指示模型将分隔内容视为纯数据
 * 3. 截断超长输入，防止上下文窗口溢出
 *
 * @param input 用户输入
 * @returns 清理后的输入（已截断至 500 字符）
 */
export function sanitizeForPrompt(input: string): string {
  // 1. 截断超长输入（防止上下文溢出）
  let cleaned = input.length > 500 ? input.substring(0, 500) : input;

  // 2. 移除 XML 分隔符字符（防止闭合标签注入）
  cleaned = cleaned.replace(/<\/?USER_INPUT>/gi, '');
  cleaned = cleaned.replace(/<\/?SYSTEM>/gi, '');
  cleaned = cleaned.replace(/<\/?INSTRUCTIONS>/gi, '');

  // 3. 移除零宽字符和控制字符（防 Unicode 混淆攻击）
  cleaned = cleaned.replace(/[\u200b-\u200f\u2028-\u202f\ufeff]/g, '');

  return cleaned.trim();
}

/**
 * 将用户输入包裹在结构化分隔符中
 *
 * 用于 prompt 构建，确保模型能区分系统指令和用户数据
 *
 * @param input 用户输入
 * @returns 带分隔符的输入
 */
export function wrapUserInput(input: string): string {
  const sanitized = sanitizeForPrompt(input);
  return `<USER_INPUT>\n${sanitized}\n</USER_INPUT>`;
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
