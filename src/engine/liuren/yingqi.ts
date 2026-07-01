/**
 * 应期推算模块
 *
 * 基于三传数理推算应验时间，
 * 提供多种应期推算方法和置信度。
 */

import type { Branch, Gan, LiurenPan } from './types.js';
import { BRANCH_INDEX } from './types.js';
import { calcKongWang } from './kongwang-detect.js';
import { CHONG_MAP, RI_MA_MAP, SAN_HE } from './constants.js';

/** 应期候选项 */
export interface YingQiCandidate {
  time: string;
  method: string;
  confidence: number;
}

/** 应期推算结果 */
export interface YingQiResult {
  candidates: YingQiCandidate[];
  primary: string;
  reasoning: string;
}

/**
 * 应期推算
 *
 * 基于多种方法推算应验时间：
 * 1. 三传数理 — 地支序数相加
 * 2. 空亡填实 — 空亡地支被填实之期
 * 3. 驿马冲动 — 驿马被冲动之期
 * 4. 三合局 — 三合局成立之期
 */
export function calculateYingQi(pan: LiurenPan): YingQiResult {
  const candidates: YingQiCandidate[] = [];

  // 方法1：三传数理
  const scNumbers = pan.sanChuan.map(item => BRANCH_INDEX[item.branch] + 1);
  const total = scNumbers.reduce((a, b) => a + b, 0);
  if (total > 0) {
    candidates.push({
      time: `${total}个时间单位后`,
      method: '三传数理（地支序数相加）',
      confidence: 0.6,
    });
  }

  // 方法2：空亡填实
  const dayGan = pan.dayGanZhi[0] as Gan;
  const dayZhi = pan.dayGanZhi[1] as Branch;
  const [kong1, kong2] = calcKongWang(dayGan, dayZhi);
  const hasKongInSC = pan.sanChuan.some(
    item => item.branch === kong1 || item.branch === kong2,
  );
  if (hasKongInSC) {
    candidates.push({
      time: `空亡填实之期（${kong1}或${kong2}日/月）`,
      method: '空亡填实',
      confidence: 0.7,
    });
  }

  // 方法3：驿马冲动
  const riMa = RI_MA_MAP[dayZhi];
  const riMaChong = CHONG_MAP[riMa];
  if (pan.sanChuan.some(item => item.branch === riMa || item.branch === riMaChong)) {
    candidates.push({
      time: `驿马${riMa}被冲动之期（${riMaChong}日/月）`,
      method: '驿马冲动',
      confidence: 0.5,
    });
  }

  // 方法4：三合局
  const scBranches = pan.sanChuan.map(item => item.branch);
  for (const branch of scBranches) {
    const [he1, he2, wx] = SAN_HE[branch] || ['', '', ''];
    if (he1 && he2 && scBranches.includes(he1) && scBranches.includes(he2)) {
      candidates.push({
        time: `${wx}局成立之期（${branch}${he1}${he2}三合）`,
        method: '三合局',
        confidence: 0.65,
      });
      break;
    }
  }

  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates,
    primary: candidates[0]?.time || '难以判断',
    reasoning: candidates.map(c => `${c.method}：${c.time}（可信度${c.confidence}）`).join('\n'),
  };
}
