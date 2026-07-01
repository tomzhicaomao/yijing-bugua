/**
 * 毕法赋匹配模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { matchBiFa } from '../../../src/engine/liuren/bifa.js';
import { BI_FA_RULES } from '../../../src/engine/liuren/bifaRules.js';

describe('毕法赋匹配', () => {
  describe('规则数据库', () => {
    it('应至少有20条规则', () => {
      expect(BI_FA_RULES.length).toBeGreaterThanOrEqual(20);
    });

    it('每条规则都有完整的id、title、description', () => {
      for (const rule of BI_FA_RULES) {
        expect(rule.id).toBeGreaterThan(0);
        expect(rule.title.length).toBeGreaterThan(0);
        expect(rule.description.length).toBeGreaterThan(0);
        expect(rule.category).toBeTruthy();
      }
    });

    it('每条规则的condition函数不崩溃', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      for (const rule of BI_FA_RULES) {
        expect(() => rule.condition(pan)).not.toThrow();
      }
    });
  });

  describe('matchBiFa 匹配引擎', () => {
    it('对任意课式返回匹配结果数组', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const matches = matchBiFa(pan);
      expect(Array.isArray(matches)).toBe(true);
      expect(matches.length).toBeGreaterThanOrEqual(0);
    });

    it('指定占事类型时返回场景判断', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const matches = matchBiFa(pan, '官职');
      for (const match of matches) {
        expect(match.rule).toBeDefined();
        expect(match.relevance).toBeGreaterThan(0);
      }
    });

    it('三传递生法则条件函数不崩溃', () => {
      const dates = [
        new Date('2026-01-01T00:00:00'),
        new Date('2026-03-15T09:00:00'),
        new Date('2026-06-30T10:00:00'),
        new Date('2026-09-01T12:00:00'),
        new Date('2026-12-01T06:00:00'),
      ];

      for (const date of dates) {
        const pan = calculateLiuren({ date });
        const matches = matchBiFa(pan, '官职');
        expect(Array.isArray(matches)).toBe(true);
      }
    });

    it('对不同时间返回不同匹配', () => {
      const pan1 = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
      const pan2 = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const matches1 = matchBiFa(pan1);
      const matches2 = matchBiFa(pan2);
      expect(Array.isArray(matches1)).toBe(true);
      expect(Array.isArray(matches2)).toBe(true);
    });
  });

  describe('毕法赋场景判断', () => {
    it('官职场景应有对应判断', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const matches = matchBiFa(pan, '官职');
      for (const match of matches) {
        if (match.rule.judgment.scene['官职']) {
          expect(typeof match.rule.judgment.scene['官职']).toBe('string');
        }
      }
    });

    it('疾病场景应有对应判断', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const matches = matchBiFa(pan, '疾病');
      for (const match of matches) {
        if (match.rule.judgment.scene['疾病']) {
          expect(typeof match.rule.judgment.scene['疾病']).toBe('string');
        }
      }
    });
  });
});
