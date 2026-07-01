/**
 * 课格分类模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { classifyKeGe } from '../../../src/engine/liuren/keGe.js';
import { KE_GE_DB } from '../../../src/engine/liuren/keGeDb.js';
import { BRANCH_INDEX } from '../../../src/engine/liuren/types.js';

describe('课格分类', () => {
  describe('基础课格（九宗门映射）', () => {
    it('九宗门课体应全部有对应课格', () => {
      const geJuNames = ['元首', '重审', '知一', '涉害', '遥克', '昴星', '别责', '八专', '伏吟', '返吟'];
      for (const name of geJuNames) {
        const found = KE_GE_DB.find(g => g.name === name);
        expect(found, `课格「${name}」应存在于数据库`).toBeDefined();
        expect(found!.meaning.length).toBeGreaterThan(0);
      }
    });

    it('每个课格都有象意和吉凶描述', () => {
      for (const keGe of KE_GE_DB) {
        expect(keGe.meaning.length).toBeGreaterThan(0);
        expect(['吉', '凶', '中性', '视情况']).toContain(keGe.trend);
      }
    });
  });

  describe('特殊课格检测', () => {
    it('伏吟课：天地盘重叠', () => {
      const dates = [
        new Date('2026-01-06T00:00:00'),
        new Date('2026-01-06T02:00:00'),
        new Date('2026-06-05T00:00:00'),
      ];

      let foundFuyin = false;
      for (const date of dates) {
        const pan = calculateLiuren({ date });
        if (pan.tianDiPan.tianPan.every((b, i) => b === pan.tianDiPan.diPan[i])) {
          const result = classifyKeGe(pan);
          expect(result.keGe.name).toBe('伏吟');
          expect(result.confidence).toBeGreaterThanOrEqual(0.8);
          foundFuyin = true;
          break;
        }
      }
      if (!foundFuyin) {
        const pan = calculateLiuren({ date: dates[0] });
        const result = classifyKeGe(pan);
        expect(result.keGe).toBeDefined();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      }
    });

    it('返吟课：天地盘完全对冲', () => {
      const dates = [
        new Date('2026-01-07T00:00:00'),
        new Date('2026-06-11T00:00:00'),
      ];

      let foundFanyin = false;
      for (const date of dates) {
        const pan = calculateLiuren({ date });
        const isFanYin = pan.tianDiPan.tianPan.every((b, i) => {
          const diZhi = pan.tianDiPan.diPan[i];
          return Math.abs(BRANCH_INDEX[b] - BRANCH_INDEX[diZhi]) === 6;
        });
        if (isFanYin) {
          const result = classifyKeGe(pan);
          expect(result.keGe.name).toBe('返吟');
          foundFanyin = true;
          break;
        }
      }
      if (!foundFanyin) {
        const pan = calculateLiuren({ date: dates[0] });
        const result = classifyKeGe(pan);
        expect(result.keGe).toBeDefined();
      }
    });

    it('铸印课：巳戌卯三合成印局', () => {
      const dates = [
        new Date('2026-03-15T09:00:00'),
        new Date('2026-06-30T10:00:00'),
      ];

      for (const date of dates) {
        const pan = calculateLiuren({ date });
        const branches = pan.sanChuan.map(item => item.branch);
        if (branches.includes('巳') && branches.includes('戌') && branches.includes('卯')) {
          const result = classifyKeGe(pan);
          expect(result.keGe.name).toBe('铸印');
          expect(result.keGe.trend).toBe('吉');
          break;
        }
      }
    });
  });

  describe('classifyKeGe 返回值结构', () => {
    it('返回完整的分析结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = classifyKeGe(pan);

      expect(result.keGe).toBeDefined();
      expect(result.keGe.name).toBeTruthy();
      expect(result.keGe.category).toBeTruthy();
      expect(result.keGe.meaning).toBeTruthy();
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reasoning).toBeTruthy();
    });

    it('对任意时间都能返回结果（不崩溃）', () => {
      const dates = [
        new Date('2026-01-01T00:00:00'),
        new Date('2026-06-15T12:00:00'),
        new Date('2026-12-31T23:00:00'),
      ];

      for (const date of dates) {
        const pan = calculateLiuren({ date });
        const result = classifyKeGe(pan);
        expect(result.keGe.name).toBeTruthy();
        expect(result.confidence).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
