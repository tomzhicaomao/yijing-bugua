/**
 * 防误判主入口
 *
 * 综合所有校验结果，输出警告列表
 */

import type { Branch, Gan, LiurenPan } from './types.js';
import { checkTaiSui } from './tai-sui-check.js';
import { detectShenShaConflict } from './shensha-conflict.js';
import { detectKongWang } from './kongwang-detect.js';

/**
 * 防误判检查参数
 */
export interface WarningCheckParams {
  pan: LiurenPan;
  yearZhi: Branch;   // 年支（太岁）
  dayGan: Gan;
  dayZhi: Branch;
}

/**
 * 执行所有防误判检查
 *
 * @param params 检查参数
 * @returns 警告字符串列表
 */
export function runAllWarnings(params: WarningCheckParams): string[] {
  const { pan, yearZhi, dayGan, dayZhi } = params;
  const warnings: string[] = [];

  // 1. 太岁校验
  const taiSui = checkTaiSui(pan, yearZhi);
  warnings.push(...taiSui.warnings);

  // 2. 神煞矛盾检测
  const conflict = detectShenShaConflict(pan.shenSha);
  if (conflict.hasConflict) {
    conflict.conflicts.forEach(c => {
      warnings.push(`⚠️ 神煞矛盾：${c.message}`);
    });
  }

  // 3. 空亡检测
  const kongWang = detectKongWang(pan.siKe, pan.sanChuan, dayGan, dayZhi);
  warnings.push(...kongWang.warnings);

  // 4. 节气边界（如果pan中已有warning则跳过重复）
  // 节气边界检查已在起课时完成，此处只收集

  // 去重
  return [...new Set(warnings)];
}
