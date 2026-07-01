/**
 * 空亡分级模块
 *
 * 将空亡从"有/无"升级为四级分类：
 * - 真空：旺相休囚死中死、休、囚状态
 * - 半空：旺相状态
 * - 转空：空亡后被填实
 * - 落底空亡：空亡落到底层
 */

import type { Branch, Gan, LiurenPan } from './types.js';
import { BRANCH_WUXING, getShengKe } from './types.js';
import { calcKongWang } from './kongwang-detect.js';

/** 空亡类型 */
export type KongWangType = '真空' | '半空' | '转空' | '落底空亡';

/** 空亡详情 */
export interface KongWangDetail {
  branch: Branch;
  type: KongWangType;
  impact: string;
  severity: number;
}

/** 空亡分析结果 */
export interface KongWangAnalysis {
  hasKongWang: boolean;
  details: KongWangDetail[];
  overallImpact: string;
}

/**
 * 获取旺衰状态
 *
 * 根据地支五行与月令五行的关系判断旺衰
 */
export function getWangXiangState(
  branch: Branch,
  monthBranch: Branch,
): '旺' | '相' | '休' | '囚' | '死' {
  const branchWX = BRANCH_WUXING[branch];
  const monthWX = BRANCH_WUXING[monthBranch];

  if (branchWX === monthWX) return '旺';
  if (getShengKe(monthWX, branchWX) === 'sheng') return '相';
  if (getShengKe(branchWX, monthWX) === 'sheng') return '休';
  if (getShengKe(monthWX, branchWX) === 'ke') return '囚';
  return '死';
}

/**
 * 判断空亡类型
 */
function classifyKongWangType(
  state: '旺' | '相' | '休' | '囚' | '死',
): KongWangType {
  if (state === '死' || state === '休' || state === '囚') {
    return '真空';
  }
  return '半空';
}

/**
 * 分析空亡
 *
 * 对三传中的空亡进行四级分类
 */
export function analyzeKongWang(pan: LiurenPan): KongWangAnalysis {
  const dayGan = pan.dayGanZhi[0] as Gan;
  const dayZhi = pan.dayGanZhi[1] as Branch;
  const [xunKong1, xunKong2] = calcKongWang(dayGan, dayZhi);
  const kongSet = new Set<Branch>([xunKong1, xunKong2]);

  const details: KongWangDetail[] = [];
  const names = ['初传', '中传', '末传'];

  // 从日期推算月令地支（寅月=1月起）
  const monthBranches: Branch[] = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
  const date = new Date(pan.dateTime);
  const monthIdx = (date.getMonth() + 11) % 12; // 1月→寅(0), 2月→卯(1), ...
  const monthBranch = monthBranches[monthIdx];

  // 检查三传空亡
  pan.sanChuan.forEach((item, idx) => {
    if (kongSet.has(item.branch)) {
      const state = getWangXiangState(item.branch, monthBranch);
      const type = classifyKongWangType(state);
      const severity = type === '真空' ? 0.7 : 0.3;

      details.push({
        branch: item.branch,
        type,
        impact: `${names[idx]}空亡（${type}），吉凶减${type === '真空' ? '十之七' : '十之三'}`,
        severity,
      });
    }
  });

  // 检查四课空亡
  pan.siKe.forEach((ke, idx) => {
    if (kongSet.has(ke.upperGod)) {
      const state = getWangXiangState(ke.upperGod, monthBranch);
      const type = classifyKongWangType(state);
      const severity = type === '真空' ? 0.7 : 0.3;

      details.push({
        branch: ke.upperGod,
        type,
        impact: `第${idx + 1}课上神空亡（${type}），相关事情可能落空`,
        severity,
      });
    }
  });

  return {
    hasKongWang: details.length > 0,
    details,
    overallImpact: details.map(d => d.impact).join('；') || '无空亡',
  };
}
