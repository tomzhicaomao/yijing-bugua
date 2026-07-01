/**
 * 六亲分析模块测试
 */

import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { analyzeLiuQin, LIU_QIN_SCENES } from '../../../src/engine/liuren/liuqin-analysis.js';

describe('六亲分析', () => {
  describe('场景数据库', () => {
    it('应覆盖所有占事类型', () => {
      const zhanShiTypes = ['官职', '婚姻', '疾病', '求财', '出行', '诉讼', '学业', '天时'];
      for (const zs of zhanShiTypes) {
        const scene = LIU_QIN_SCENES.find(s => s.zhanShi === zs);
        expect(scene, `缺少「${zs}」场景`).toBeDefined();
      }
    });

    it('每个场景应有5种六亲角色', () => {
      const liuQinTypes = ['官鬼', '父母', '兄弟', '子孙', '妻财'];
      for (const scene of LIU_QIN_SCENES) {
        for (const lq of liuQinTypes) {
          expect(scene.roles[lq], `场景「${scene.zhanShi}」缺少「${lq}」角色`).toBeDefined();
          expect(scene.roles[lq].meaning.length).toBeGreaterThan(0);
          expect(scene.roles[lq].weight).toBeGreaterThan(0);
          expect(scene.roles[lq].weight).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('analyzeLiuQin 分析函数', () => {
    it('占官职，用神为官鬼', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeLiuQin(pan, '官职');
      expect(result.yongShen).toBe('官鬼');
      expect(result.summary).toBeTruthy();
    });

    it('占求财，用神为妻财', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeLiuQin(pan, '求财');
      expect(result.yongShen).toBe('妻财');
    });

    it('占婚姻，用神为妻财', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeLiuQin(pan, '婚姻');
      expect(result.yongShen).toBe('妻财');
    });

    it('不指定占事类型时，返回默认结果', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeLiuQin(pan);
      expect(result.yongShen).toBe('官鬼');
      expect(result.signals.length).toBe(0);
    });

    it('三传六亲信息完整', () => {
      const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
      const result = analyzeLiuQin(pan, '官职');
      expect(result.summary).toContain('初传');
      expect(result.summary).toContain('中传');
      expect(result.summary).toContain('末传');
    });

    it('对任意时间都能返回结果（不崩溃）', () => {
      const dates = [
        new Date('2026-01-01T00:00:00'),
        new Date('2026-06-15T12:00:00'),
        new Date('2026-12-31T23:00:00'),
      ];

      for (const date of dates) {
        const pan = calculateLiuren({ date });
        const result = analyzeLiuQin(pan, '疾病');
        expect(result.yongShen).toBeTruthy();
        expect(result.summary).toBeTruthy();
      }
    });
  });
});
