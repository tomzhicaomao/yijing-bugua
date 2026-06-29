/**
 * ③ 涉害法
 *
 * 前提：比用法返回了 null（多个候选且多与日干同阴阳）
 *
 * 涉害深度计算方法：
 *   对每个候选地支，计算其在地盘的涉害深度：
 *   从该地支在地盘的位置开始，顺时针数十二位
 *   每遇到一次"克我"（该位地支五行克候选地支五行）就记一次
 *
 * 规则：
 *   1. 计算所有候选的涉害深度
 *   2. 取涉害最深者（最大值）对应的上神为初传
 *   3. 若深度相同 → 取在四课中先出现的
 */

import type { Branch, Gan, SiKeItem, SanChuanResult, TianDiPan, WuXing } from '../types.js';
import { BRANCH_WUXING, ALL_BRANCHES, BRANCH_INDEX } from '../types.js';
import { deriveZhongMoChuan } from '../sanchuan.js';
import { getZekeCandidates } from './zeke.js';
import { KE_MATRIX } from '../constants.js';

/**
 * 计算某地支的涉害深度
 *
 * 从该地支在地盘的位置开始，顺时针数十二位
 * 每遇到一次"克我"（该位地支五行克候选地支五行）就记一次
 *
 * @param candidateBranch 候选地支
 * @returns 涉害深度
 */
export function calculateShehaiDepth(candidateBranch: Branch): number {
  const candidateWuXing: WuXing = BRANCH_WUXING[candidateBranch];
  const startIdx = BRANCH_INDEX[candidateBranch];
  let depth = 0;

  for (let i = 1; i <= 12; i++) {
    const currentBranch = ALL_BRANCHES[(startIdx + i) % 12];
    const currentWuXing: WuXing = BRANCH_WUXING[currentBranch];
    if (KE_MATRIX[currentWuXing][candidateWuXing]) {
      depth++;
    }
  }

  return depth;
}

/**
 * 涉害法计算
 *
 * @returns 三传结果，或 null
 */
export function shehai(
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem],
  _dayGan: Gan,
  tianDiPan: TianDiPan,
): SanChuanResult | null {
  // 获取贼克法的候选
  const zekeResult = getZekeCandidates(siKe);
  if (!zekeResult) return null;

  const { candidates } = zekeResult;

  // 如果只有一个候选，不应该进入涉害法
  if (candidates.length <= 1) return null;

  // 计算所有候选的涉害深度
  const depths = candidates.map(branch => ({
    branch,
    depth: calculateShehaiDepth(branch),
    // 记录在四课中出现的位置（用于深度相同时取先出现的）
    position: siKe.findIndex(item => item.upperGod === branch),
  }));

  // 找最大深度
  const maxDepth = Math.max(...depths.map(d => d.depth));

  // 筛选深度最大的候选
  const maxDepthCandidates = depths.filter(d => d.depth === maxDepth);

  // 深度相同时取先出现的（position 较小的）
  const winner = maxDepthCandidates.reduce((prev, curr) =>
    curr.position < prev.position ? curr : prev
  );

  const chuChuan = winner.branch;
  const [zhongChuan, moChuan] = deriveZhongMoChuan(chuChuan, tianDiPan);

  return {
    chuChuan,
    zhongChuan,
    moChuan,
    geJu: '涉害',
    details: `涉害法：深度${winner.depth}，取${chuChuan}`,
  };
}
