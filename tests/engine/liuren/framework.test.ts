/**
 * 框架层总入口测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { analyzeFramework } from '../../../src/engine/liuren/framework.js';

describe('框架层总入口', () => {
  describe('analyzeFramework', () => {
    it('对任意课式返回完整的框架分析结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeFramework(pan, '官职');

      expect(result.keGe).toBeDefined();
      expect(result.keGe.keGe.name).toBeTruthy();

      expect(Array.isArray(result.bifa)).toBe(true);

      expect(result.tianJiang).toBeDefined();
      expect(result.tianJiang.sanChuanJiang.length).toBe(3);

      expect(result.liuQin).toBeDefined();
      expect(result.liuQin.yongShen).toBeTruthy();

      expect(result.kongWang).toBeDefined();
      expect(typeof result.kongWang.hasKongWang).toBe('boolean');
      expect(Array.isArray(result.kongWang.details)).toBe(true);

      expect(result.yingQi).toBeDefined();
      expect(Array.isArray(result.yingQi.candidates)).toBe(true);
      expect(typeof result.yingQi.primary).toBe('string');

      expect(Array.isArray(result.signals)).toBe(true);
    });

    it('不指定占事类型时也能返回结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeFramework(pan);

      expect(result.keGe).toBeDefined();
      expect(result.tianJiang).toBeDefined();
      expect(result.liuQin).toBeDefined();
    });

    it('信号按权重降序排列', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeFramework(pan, '官职');

      for (let i = 1; i < result.signals.length; i++) {
        expect(result.signals[i].weight).toBeLessThanOrEqual(result.signals[i - 1].weight);
      }
    });

    it('对不同时间返回不同的分析结果', () => {
      const pan1 = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
      const pan2 = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result1 = analyzeFramework(pan1, '求财');
      const result2 = analyzeFramework(pan2, '求财');

      expect(result1.keGe).toBeDefined();
      expect(result2.keGe).toBeDefined();
    });

    it('对所有占事类型都能返回结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const zhanShiTypes = ['官职', '婚姻', '疾病', '求财', '出行', '诉讼', '学业', '天时'] as const;

      for (const zs of zhanShiTypes) {
        const result = analyzeFramework(pan, zs);
        expect(result.keGe).toBeDefined();
        expect(result.tianJiang).toBeDefined();
        expect(result.liuQin).toBeDefined();
      }
    });
  });
});
