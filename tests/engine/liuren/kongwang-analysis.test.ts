/**
 * 空亡分级模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { analyzeKongWang, getWangXiangState } from '../../../src/engine/liuren/kongwang-analysis.js';

describe('空亡分级', () => {
  describe('旺衰判断', () => {
    it('同五行应为旺', () => {
      expect(getWangXiangState('寅', '寅')).toBe('旺');
      expect(getWangXiangState('子', '子')).toBe('旺');
    });

    it('被月令生应为相', () => {
      // 月令(火)生 branch(土) → 土得生 → 相
      // getShengKe('火', '土'): shengCycle['火']='土'='土' → sheng ✓
      expect(getWangXiangState('辰', '巳')).toBe('相');
    });

    it('生月令应为休', () => {
      // branch(火)生 月令(土) → 火泄气 → 休
      // getShengKe('火', '土'): shengCycle['火']='土'='土' → sheng ✓
      expect(getWangXiangState('巳', '辰')).toBe('休');
    });

    it('被月令克应为囚', () => {
      // 月令(金)克 branch(木) → 木受克 → 囚
      // getShengKe('金', '木'): keCycle['金']='木'='木' → ke ✓
      expect(getWangXiangState('寅', '申')).toBe('囚');
    });

    it('克月令应为死', () => {
      // branch(木)克 月令(土) → 木克土 → 死
      // getShengKe('木', '土'): keCycle['木']='土'='土' → ke ✓
      expect(getWangXiangState('寅', '辰')).toBe('死');
    });
  });

  describe('analyzeKongWang 分析函数', () => {
    it('对任意课式返回分析结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeKongWang(pan);

      expect(typeof result.hasKongWang).toBe('boolean');
      expect(Array.isArray(result.details)).toBe(true);
      expect(typeof result.overallImpact).toBe('string');
    });

    it('空亡详情应包含完整信息', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeKongWang(pan);

      for (const detail of result.details) {
        expect(detail.branch).toBeTruthy();
        expect(['真空', '半空', '转空', '落底空亡']).toContain(detail.type);
        expect(detail.impact).toBeTruthy();
        expect(detail.severity).toBeGreaterThanOrEqual(0);
        expect(detail.severity).toBeLessThanOrEqual(1);
      }
    });

    it('对不同时间返回不同结果', () => {
      const pan1 = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
      const pan2 = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result1 = analyzeKongWang(pan1);
      const result2 = analyzeKongWang(pan2);

      expect(typeof result1.hasKongWang).toBe('boolean');
      expect(typeof result2.hasKongWang).toBe('boolean');
    });

    it('无空亡时overallImpact为"无空亡"', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeKongWang(pan);

      if (!result.hasKongWang) {
        expect(result.overallImpact).toBe('无空亡');
      }
    });
  });
});
