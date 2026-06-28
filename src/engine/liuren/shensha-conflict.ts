/**
 * 神煞矛盾检测
 *
 * 检测吉凶神煞矛盾，例如同时见吉神和凶神在同一地支
 */

import type { Branch, ShenShaItem } from './types.js';

/**
 * 矛盾检测结果
 */
export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    branch: Branch;
    jiShens: string[];   // 吉神列表
    xiongShens: string[]; // 凶神列表
    message: string;
  }>;
}

/**
 * 检测神煞矛盾
 *
 * @param shenShaList 神煞列表
 * @returns 矛盾检测结果
 */
export function detectShenShaConflict(
  shenShaList: ShenShaItem[],
): ConflictResult {
  const conflicts: ConflictResult['conflicts'] = [];

  // 按地支分组
  const branchGroups = new Map<Branch, { ji: string[]; xiong: string[] }>();

  shenShaList.forEach(item => {
    if (!branchGroups.has(item.branch)) {
      branchGroups.set(item.branch, { ji: [], xiong: [] });
    }
    const group = branchGroups.get(item.branch)!;
    if (item.category === '吉') {
      group.ji.push(item.name);
    } else if (item.category === '凶') {
      group.xiong.push(item.name);
    }
  });

  // 检查矛盾
  branchGroups.forEach((group, branch) => {
    if (group.ji.length > 0 && group.xiong.length > 0) {
      conflicts.push({
        branch,
        jiShens: group.ji,
        xiongShens: group.xiong,
        message: `${branch}位吉凶并见：${group.ji.join('、')}（吉）与${group.xiong.join('、')}（凶）冲突 — 好坏交织，别只看一面，需综合判断`,
      });
    }
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
