/**
 * 太岁校验
 *
 * 检查课式中是否有太岁相关的影响
 */

import type { Branch, Gan, LiurenPan } from './types.js';

/**
 * 太岁校验结果
 */
export interface TaiSuiCheckResult {
  hasTaiSui: boolean;       // 课中是否有太岁
  taiSuiBranch: Branch;     // 太岁地支
  warnings: string[];       // 警告信息
}

/**
 * 太岁校验
 *
 * @param pan 完整课式
 * @param yearZhi 年支（太岁）
 * @returns 校验结果
 */
export function checkTaiSui(
  pan: LiurenPan,
  yearZhi: Branch,
): TaiSuiCheckResult {
  const warnings: string[] = [];
  let hasTaiSui = false;

  // 检查四课中是否有太岁
  pan.siKe.forEach((item, idx) => {
    if (item.upperGod === yearZhi || item.lowerGod === yearZhi) {
      hasTaiSui = true;
      warnings.push(`第${idx + 1}课见太岁（${yearZhi}），主年内之事`);
    }
  });

  // 检查三传中是否有太岁
  pan.sanChuan.forEach((item, idx) => {
    const names = ['初传', '中传', '末传'];
    if (item.branch === yearZhi) {
      hasTaiSui = true;
      warnings.push(`${names[idx]}见太岁（${yearZhi}），主年内之事`);
    }
  });

  // 检查年命冲太岁
  // 这个需要用户出生年，这里只做一般性检查

  return {
    hasTaiSui,
    taiSuiBranch: yearZhi,
    warnings,
  };
}
