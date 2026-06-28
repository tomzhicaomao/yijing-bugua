/**
 * 四课测试
 */

import { describe, it, expect } from 'vitest';
import { buildSiKe, analyzeSiKe, getKeRelation } from '../../../src/engine/liuren/sike.js';
import { buildTianDiPan } from '../../../src/engine/liuren/tiandi-pan.js';
import type { Branch, Gan } from '../../../src/engine/liuren/types.js';

describe('sike.ts 四课生成', () => {

  it('getKeRelation 上克下', () => {
    // 金克木
    expect(getKeRelation('申', '寅')).toBe('上克下');
  });

  it('getKeRelation 下贼上', () => {
    // 木克土，下(寅)克上(丑)...不对，寅是木，丑是土，所以下贼上
    // 实际上：下神丑（土）不克上神寅（木），反而是上神寅（木）克下神丑（土）
    // 改为：火克金，午(火)克酉(金)
    expect(getKeRelation('酉', '午')).toBe('下贼上');
  });

  it('getKeRelation 比和', () => {
    expect(getKeRelation('子', '子')).toBe('比和');
    // 不同五行但不相克也比和
    expect(getKeRelation('子', '寅')).toBe('比和');
  });

  it('buildSiKe 生成四课', () => {
    // 甲子日，月将丑，占时寅
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);

    expect(siKe).toHaveLength(4);
    // 每课都有上神、下神、关系
    siKe.forEach(item => {
      expect(item.upperGod).toBeDefined();
      expect(item.lowerGod).toBeDefined();
      expect(item.relation).toBeDefined();
    });
  });

  it('四课完整性：上神和下神都是合法地支', () => {
    const validBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const tianDiPan = buildTianDiPan('亥', '子');
    const siKe = buildSiKe('丙', '午', tianDiPan);

    siKe.forEach(item => {
      expect(validBranches).toContain(item.upperGod);
      expect(validBranches).toContain(item.lowerGod);
    });
  });

  it('analyzeSiKe 分析正确', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);
    const analysis = analyzeSiKe(siKe);

    expect(analysis.keShangCount + analysis.xiaZeCount + analysis.biHeCount).toBe(4);
    expect(typeof analysis.hasKe).toBe('boolean');
    expect(typeof analysis.allBiHe).toBe('boolean');
  });

  it('不同日干生成不同四课', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe1 = buildSiKe('甲', '子', tianDiPan);
    const siKe2 = buildSiKe('乙', '子', tianDiPan);
    // 甲乙日干寄宫不同，第一课应不同
    expect(siKe1[0].lowerGod).not.toBe(siKe2[0].lowerGod);
  });

  it('第一课下神为日干寄宫', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);
    // 甲寄宫寅
    expect(siKe[0].lowerGod).toBe('寅');
  });

  it('第三课下神为日支', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);
    expect(siKe[2].lowerGod).toBe('子');
  });
});
