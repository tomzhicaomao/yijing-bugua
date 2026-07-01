/**
 * 大六壬编译时常量矩阵
 *
 * 所有预计算的五行/地支/天干关系表
 * 用于避免运行时字符串比较，提升计算性能
 */

import type { Branch, Gan, WuXing } from './types.js';
import { ALL_BRANCHES } from './types.js';

// ========== 五行相克矩阵 ==========

/**
 * 五行相克关系预计算
 * KE_MATRIX[a][b] = true 表示 a 克 b
 *
 * 木克土、土克水、水克火、火克金、金克木
 */
export const KE_MATRIX: Record<WuXing, Record<WuXing, boolean>> = {
  '木': { '木': false, '火': false, '土': true,  '金': false, '水': false },
  '火': { '木': false, '火': false, '土': false, '金': true,  '水': false },
  '土': { '木': false, '火': false, '土': false, '金': false, '水': true  },
  '金': { '木': true,  '火': false, '土': false, '金': false, '水': false },
  '水': { '木': false, '火': true,  '土': false, '金': false, '水': false },
};

// ========== 五行相生矩阵 ==========

/**
 * 五行相生关系预计算
 * SHENG_MATRIX[a][b] = true 表示 a 生 b
 *
 * 木生火、火生土、土生金、金生水、水生木
 */
export const SHENG_MATRIX: Record<WuXing, Record<WuXing, boolean>> = {
  '木': { '木': false, '火': true,  '土': false, '金': false, '水': false },
  '火': { '木': false, '火': false, '土': true,  '金': false, '水': false },
  '土': { '木': false, '火': false, '土': false, '金': true,  '水': false },
  '金': { '木': false, '火': false, '土': false, '金': false, '水': true  },
  '水': { '木': true,  '火': false, '土': false, '金': false, '水': false },
};

// ========== 地支六冲 ==========

/**
 * 地支六冲预计算
 * 子午冲、丑未冲、寅申冲、卯酉冲、辰戌冲、巳亥冲
 */
export const CHONG_MAP: Record<Branch, Branch> = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉',
  '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
  '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳',
};

// ========== 地支相刑 ==========

/**
 * 刑神预计算
 * 三刑：寅刑巳、巳刑申、申刑寅（无恩之刑）
 *       丑刑戌、戌刑未、未刑丑（恃势之刑）
 *       子刑卯、卯刑子（无礼之刑）
 *       辰午酉亥 — 自刑
 */
export const XING_MAP: Record<Branch, Branch> = {
  '子': '卯', '卯': '子', '寅': '巳', '巳': '申',
  '申': '寅', '丑': '戌', '戌': '未', '未': '丑',
  '辰': '辰', '午': '午', '酉': '酉', '亥': '亥',  // 自刑
};

// ========== 地支六合 ==========

/**
 * 地支六合预计算
 * 子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合
 */
export const HE_MAP: Record<Branch, Branch> = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳', '午': '未', '未': '午',
};

// ========== 地支三合局 ==========

/**
 * 地支三合局
 * 申子辰 → 水局  寅午戌 → 火局
 * 巳酉丑 → 金局  亥卯未 → 木局
 */
export const SAN_HE: Record<Branch, [Branch, Branch, WuXing]> = {
  '申': ['子', '辰', '水'],
  '子': ['辰', '申', '水'],
  '辰': ['申', '子', '水'],
  '寅': ['午', '戌', '火'],
  '午': ['戌', '寅', '火'],
  '戌': ['寅', '午', '火'],
  '巳': ['酉', '丑', '金'],
  '酉': ['丑', '巳', '金'],
  '丑': ['巳', '酉', '金'],
  '亥': ['卯', '未', '木'],
  '卯': ['未', '亥', '木'],
  '未': ['亥', '卯', '木'],
};

// ========== 驿马 — 日支查驿马 ==========

/**
 * 驿马日支映射
 * 申子辰日 → 驿马在寅
 * 亥卯未日 → 驿马在巳
 * 寅午戌日 → 驿马在申
 * 巳酉丑日 → 驿马在亥
 */
export const RI_MA_MAP: Record<Branch, Branch> = {
  '申': '寅', '子': '寅', '辰': '寅',
  '亥': '巳', '卯': '巳', '未': '巳',
  '寅': '申', '午': '申', '戌': '申',
  '巳': '亥', '酉': '亥', '丑': '亥',
};

// ========== 天干禄神 ==========

/**
 * 天干禄（临官）地支
 * 甲禄寅、乙禄卯、丙戊禄巳、丁己禄午、庚禄申、辛禄酉、壬禄亥、癸禄子
 */
export const LU_MAP: Record<Gan, Branch> = {
  '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
  '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子',
};

// ========== 地支墓库 ==========

/**
 * 地支墓（墓库）地支
 * 申子辰墓在辰、寅午戌墓在戌、巳酉丑墓在丑、亥卯未墓在未
 */
export const MU_KU_MAP: Record<Branch, Branch> = {
  '子': '辰', '丑': '辰', '寅': '未', '卯': '未',
  '辰': '戌', '巳': '戌', '午': '丑', '未': '丑',
  '申': '辰', '酉': '辰', '戌': '未', '亥': '未',
};

// ========== 天干五合 ==========

/**
 * 天干五合预计算
 * 甲己合化土、乙庚合化金、丙辛合化水、丁壬合化木、戊癸合化火
 */
export const GAN_HE: Record<Gan, Gan> = {
  '甲': '己', '乙': '庚', '丙': '辛', '丁': '壬', '戊': '癸',
  '己': '甲', '庚': '乙', '辛': '丙', '壬': '丁', '癸': '戊',
};

/**
 * 天干五合化五行
 */
export const GAN_HE_WUXING: Record<Gan, WuXing> = {
  '甲': '土', '乙': '金', '丙': '水', '丁': '木', '戊': '火',
  '己': '土', '庚': '金', '辛': '水', '壬': '木', '癸': '火',
};

// ========== 天干阴阳 ==========

/**
 * 天干阴阳
 */
export const GAN_YINYANG: Record<Gan, '阳' | '阴'> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴', '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
};

// ========== 地支六害 ==========

/**
 * 地支六害（穿）
 * 子未害、丑午害、寅巳害、卯辰害、申亥害、酉戌害
 */
export const HAI_MAP: Record<Branch, Branch> = {
  '子': '未', '未': '子', '丑': '午', '午': '丑',
  '寅': '巳', '巳': '寅', '卯': '辰', '辰': '卯',
  '申': '亥', '亥': '申', '酉': '戌', '戌': '酉',
};

// ========== 辅助函数 ==========

/**
 * 判断 a 是否克 b（使用五行相克矩阵）
 */
export function isKe(a: WuXing, b: WuXing): boolean {
  return KE_MATRIX[a][b];
}

/**
 * 判断 a 是否生 b（使用五行相生矩阵）
 */
export function isSheng(a: WuXing, b: WuXing): boolean {
  return SHENG_MATRIX[a][b];
}

/**
 * 五行生克关系判断
 * @returns 'sheng' | 'ke' | 'bihe'
 */
export function getShengKe(a: WuXing, b: WuXing): 'sheng' | 'ke' | 'bihe' {
  if (a === b) return 'bihe';
  if (isSheng(a, b)) return 'sheng';
  if (isKe(a, b)) return 'ke';
  return 'bihe';
}

/**
 * 判断两个地支是否相冲
 */
export function isChong(a: Branch, b: Branch): boolean {
  return CHONG_MAP[a] === b;
}

/**
 * 判断两个地支是否相刑
 */
export function isXing(a: Branch, b: Branch): boolean {
  return XING_MAP[a] === b;
}

/**
 * 判断两个地支是否六合
 */
export function isHe(a: Branch, b: Branch): boolean {
  return HE_MAP[a] === b;
}

/**
 * 判断两个地支是否六害
 */
export function isHai(a: Branch, b: Branch): boolean {
  return HAI_MAP[a] === b;
}

/**
 * 获取三合局的另外两个地支
 */
export function getSanHe(branch: Branch): [Branch, Branch, WuXing] {
  return SAN_HE[branch];
}

/**
 * 判断天干是否阳干
 */
export function isYangGan(gan: Gan): boolean {
  return GAN_YINYANG[gan] === '阳';
}

/**
 * 判断地支是否阳支
 */
export function isYangBranch(branch: Branch): boolean {
  const yangBranches: Branch[] = ['子', '寅', '辰', '午', '申', '戌'];
  return yangBranches.includes(branch);
}

/**
 * 地支顺行一步（顺数）
 */
export function nextBranch(branch: Branch, steps: number = 1): Branch {
  const idx = ALL_BRANCHES.indexOf(branch);
  return ALL_BRANCHES[(idx + steps) % 12];
}

/**
 * 地支逆行一步（逆数）
 */
export function prevBranch(branch: Branch, steps: number = 1): Branch {
  const idx = ALL_BRANCHES.indexOf(branch);
  return ALL_BRANCHES[(idx - steps + 12) % 12];
}
