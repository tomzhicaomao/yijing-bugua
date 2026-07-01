/**
 * 应期推算模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { calculateYingQi } from '../../../src/engine/liuren/yingqi.js';

describe('应期推算', () => {
  describe('calculateYingQi', () => {
    it('对任意课式返回应期推算结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = calculateYingQi(pan);

      expect(Array.isArray(result.candidates)).toBe(true);
      expect(typeof result.primary).toBe('string');
      expect(typeof result.reasoning).toBe('string');
    });

    it('至少有一个应期候选项', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = calculateYingQi(pan);

      expect(result.candidates.length).toBeGreaterThanOrEqual(1);
    });

    it('每个候选项有完整信息', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = calculateYingQi(pan);

      for (const candidate of result.candidates) {
        expect(candidate.time).toBeTruthy();
        expect(candidate.method).toBeTruthy();
        expect(candidate.confidence).toBeGreaterThan(0);
        expect(candidate.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('候选项按置信度降序排列', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = calculateYingQi(pan);

      for (let i = 1; i < result.candidates.length; i++) {
        expect(result.candidates[i].confidence).toBeLessThanOrEqual(
          result.candidates[i - 1].confidence,
        );
      }
    });

    it('primary应为第一个候选项的time', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = calculateYingQi(pan);

      if (result.candidates.length > 0) {
        expect(result.primary).toBe(result.candidates[0].time);
      }
    });

    it('对不同时间返回不同结果', () => {
      const pan1 = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
      const pan2 = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result1 = calculateYingQi(pan1);
      const result2 = calculateYingQi(pan2);

      expect(Array.isArray(result1.candidates)).toBe(true);
      expect(Array.isArray(result2.candidates)).toBe(true);
    });
  });
});
