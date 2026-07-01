import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';

describe('calculateLiuren 输入验证', () => {
  it('拒绝无效日期 (NaN)', () => {
    expect(() => calculateLiuren({ date: new Date('invalid') })).toThrow('无效的日期参数');
  });

  it('拒绝 null 参数', () => {
    expect(() => calculateLiuren(null as never)).toThrow();
  });

  it('拒绝 undefined 参数', () => {
    expect(() => calculateLiuren(undefined as never)).toThrow();
  });

  it('拒绝 1901 年前的日期', () => {
    expect(() => calculateLiuren({ date: new Date(1900, 0, 1) })).toThrow('不支持 1901 年前');
  });

  it('拒绝无效时辰', () => {
    expect(() => calculateLiuren({
      date: new Date('2026-06-15T10:00:00'),
      shiZhi: '无效' as never,
    })).toThrow('无效的时辰');
  });

  it('接受有效日期', () => {
    const pan = calculateLiuren({ date: new Date('2026-06-15T10:00:00') });
    expect(pan.dayGanZhi).toBeTruthy();
    expect(pan.siKe).toHaveLength(4);
    expect(pan.sanChuan).toHaveLength(3);
  });

  it('接受有效时辰', () => {
    const pan = calculateLiuren({
      date: new Date('2026-06-15T10:00:00'),
      shiZhi: '巳',
    });
    expect(pan.shiZhi).toBe('巳');
  });
});
