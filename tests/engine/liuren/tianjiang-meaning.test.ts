/**
 * 天将象义模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { analyzeTianJiang, TIAN_JIANG_MEANINGS } from '../../../src/engine/liuren/tianjiang-meaning.js';

describe('天将象义', () => {
  describe('数据库完整性', () => {
    it('应包含12个天将', () => {
      expect(TIAN_JIANG_MEANINGS.length).toBe(12);
    });

    it('每个天将都有五行和基础吉凶', () => {
      for (const tj of TIAN_JIANG_MEANINGS) {
        expect(tj.name).toBeTruthy();
        expect(tj.wuXing).toBeTruthy();
        expect(['吉', '凶', '中性']).toContain(tj.baseJiXiong);
      }
    });

    it('每个天将应覆盖7种占事类型', () => {
      const zhanShiTypes = ['官职', '婚姻', '疾病', '求财', '出行', '诉讼', '学业'];
      for (const tj of TIAN_JIANG_MEANINGS) {
        for (const zs of zhanShiTypes) {
          expect(tj.meanings[zs], `天将「${tj.name}」缺少「${zs}」象义`).toBeDefined();
          expect(tj.meanings[zs]!.primary.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('analyzeTianJiang 分析函数', () => {
    it('对任意课式返回分析结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeTianJiang(pan, '官职');

      expect(result.sanChuanJiang.length).toBe(3);
      expect(result.summary).toBeTruthy();
      expect(Array.isArray(result.signals)).toBe(true);
    });

    it('不指定占事类型时，不生成信号', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeTianJiang(pan);

      expect(result.sanChuanJiang.length).toBe(3);
      expect(result.signals.length).toBe(0);
    });

    it('三传天将信息完整', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeTianJiang(pan, '官职');

      for (const item of result.sanChuanJiang) {
        expect(item.branch).toBeTruthy();
        expect(item.jiang).toBeTruthy();
      }
    });

    it('对不同时间返回不同天将组合', () => {
      const pan1 = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
      const pan2 = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result1 = analyzeTianJiang(pan1, '官职');
      const result2 = analyzeTianJiang(pan2, '官职');

      expect(result1.sanChuanJiang.length).toBe(3);
      expect(result2.sanChuanJiang.length).toBe(3);
    });
  });
});
