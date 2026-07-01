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

// ========== 大六壬占事分类 ==========

export const ZHAN_SHI_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: '官职', label: '官职', desc: '工作·事业·升迁' },
  { value: '婚姻', label: '婚姻', desc: '感情·恋爱·婚配' },
  { value: '疾病', label: '疾病', desc: '健康·医疗·康复' },
  { value: '求财', label: '求财', desc: '财运·投资·生意' },
  { value: '出行', label: '出行', desc: '旅行·搬迁·远行' },
  { value: '诉讼', label: '诉讼', desc: '官司·纠纷·法律' },
  { value: '学业', label: '学业', desc: '考试·读书·论文' },
  { value: '天时', label: '天时', desc: '天气·自然' },
  { value: '其他', label: '其他', desc: '以上未涵盖' },
];

// ========== 大六壬功能开关 ==========
export const FEATURE_LIUREN_ENABLED =
  import.meta.env.VITE_FEATURE_LIUREN_ENABLED !== 'false'; // 默认开启
