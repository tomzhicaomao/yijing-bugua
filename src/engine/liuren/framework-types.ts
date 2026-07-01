/**
 * 框架层共享类型
 *
 * 定义框架层各模块共享的类型，
 * 避免模块间循环依赖。
 */

/** 课格大类 */
export type KeGeCategory =
  | '贼克'
  | '比用'
  | '涉害'
  | '遥克'
  | '昴星'
  | '别责'
  | '八专'
  | '伏吟'
  | '返吟'
  | '特殊';

/** 判断信号 */
export interface JudgmentSignal {
  type: '吉' | '凶' | '中性';
  source: string;
  description: string;
  weight: number;
}
