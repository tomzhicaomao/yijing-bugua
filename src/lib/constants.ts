import type { Category } from '../types'

export const SCHEMA_VERSION = 1

export const PROMPT_VERSION = '1.0'

export const DEFAULT_MODEL = 'deepseek-v4-flash'
export const DEEP_MODEL = 'deepseek-v4-pro'
export const DEFAULT_TEMPERATURE = 0.7

export const FEEDBACK_DUE_DAYS: Record<Category, number> = {
  '工作': 7,
  '人际': 7,
  '财务': 7,
  '健康': 14,
  '其他': 7,
}

export const CATEGORIES: Category[] = ['工作', '人际', '财务', '健康', '其他']

export const APP_NAME = '易经占卜'
export const EXPORT_FILENAME_PREFIX = 'yijing-export'
