/**
 * 框架层总入口
 *
 * 整合所有框架层模块，提供统一入口。
 * 包括：课格分类、毕法赋匹配、天将象义、六亲分析、空亡分级、应期推算。
 */

import type { LiurenPan } from './types.js';
import type { ZhanShi } from './bifa.js';
import { classifyKeGe } from './keGe.js';
import type { KeGeAnalysis } from './keGe.js';
import { matchBiFa } from './bifa.js';
import type { BiFaMatch } from './bifa.js';
import { analyzeTianJiang } from './tianjiang-meaning.js';
import type { TianJiangAnalysis } from './tianjiang-meaning.js';
import { analyzeLiuQin } from './liuqin-analysis.js';
import type { LiuQinAnalysis } from './liuqin-analysis.js';
import { analyzeKongWang } from './kongwang-analysis.js';
import type { KongWangAnalysis } from './kongwang-analysis.js';
import { calculateYingQi } from './yingqi.js';
import type { YingQiResult } from './yingqi.js';
import type { JudgmentSignal } from './framework-types.js';

// Re-export JudgmentSignal from framework-types for external consumers
export type { JudgmentSignal } from './framework-types.js';

/** 框架层分析结果 */
export interface FrameworkAnalysis {
  keGe: KeGeAnalysis;
  bifa: BiFaMatch[];
  tianJiang: TianJiangAnalysis;
  liuQin: LiuQinAnalysis;
  kongWang: KongWangAnalysis;
  yingQi: YingQiResult;
  signals: JudgmentSignal[];
}

/**
 * 框架层总入口
 *
 * 对一个完整课式进行多维度分析：
 * 1. 课格分类 — 确定课体格局
 * 2. 毕法赋匹配 — 查找适用的判断法则
 * 3. 天将象义 — 分析天将语义
 * 4. 六亲分析 — 按占事类型分析六亲
 * 5. 空亡分级 — 四级空亡分类
 * 6. 应期推算 — 推算应验时间
 * 7. 综合信号 — 汇总所有信号并排序
 */
export function analyzeFramework(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): FrameworkAnalysis {
  const keGe = classifyKeGe(pan);
  const bifa = matchBiFa(pan, zhanShi);
  const tianJiang = analyzeTianJiang(pan, zhanShi);
  const liuQin = analyzeLiuQin(pan, zhanShi);
  const kongWang = analyzeKongWang(pan);
  const yingQi = calculateYingQi(pan);

  // 综合所有信号
  const signals: JudgmentSignal[] = [
    // 课格信号
    ...(keGe.keGe.trend !== '中性' ? [{
      type: keGe.keGe.trend as '吉' | '凶',
      source: `课格「${keGe.keGe.name}」`,
      description: keGe.keGe.meaning,
      weight: 0.9,
    }] : []),
    // 毕法赋信号
    ...bifa.map(b => ({
      type: b.rule.judgment.trend,
      source: `毕法赋第${b.rule.id}法「${b.rule.title}」`,
      description: b.sceneJudgment || b.rule.description,
      weight: 0.8,
    })),
    // 天将信号
    ...tianJiang.signals,
    // 六亲信号
    ...liuQin.signals,
    // 空亡信号
    ...kongWang.details.map(d => ({
      type: '凶' as const,
      source: `空亡「${d.branch}」`,
      description: d.impact,
      weight: d.severity,
    })),
  ];

  // 按权重降序排列
  signals.sort((a, b) => b.weight - a.weight);

  return { keGe, bifa, tianJiang, liuQin, kongWang, yingQi, signals };
}
