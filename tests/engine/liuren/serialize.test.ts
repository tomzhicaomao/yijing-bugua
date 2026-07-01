import { describe, it, expect } from 'vitest';
import { serializePan, deserializePan } from '../../../src/engine/liuren/serialize.js';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import type { LiurenPanData } from '../../../src/types/index.js';

describe('serialize/deserialize', () => {
  const testDate = new Date('2026-06-15T10:00:00');
  const pan = calculateLiuren({ date: testDate });

  it('serializePan 输出 LiurenPanData 格式', () => {
    const data = serializePan(pan);
    expect(data.dateTime).toBe(pan.dateTime);
    expect(data.dayGanZhi).toBe(pan.dayGanZhi);
    expect(data.shiZhi).toBe(pan.shiZhi);
    expect(data.geJu).toBe(pan.geJu);
    expect(data.siKe).toHaveLength(4);
    expect(data.sanChuan).toHaveLength(3);
    expect(data.warnings).toEqual(pan.warnings);
  });

  it('deserializePan 恢复完整 LiurenPan', () => {
    const data = serializePan(pan);
    const restored = deserializePan(data);
    expect(restored.dayGanZhi).toBe(pan.dayGanZhi);
    expect(restored.shiZhi).toBe(pan.shiZhi);
    expect(restored.geJu).toBe(pan.geJu);
    expect(restored.siKe).toHaveLength(4);
    expect(restored.sanChuan).toHaveLength(3);
    expect(restored.tianDiPan.diPan).toHaveLength(12);
    expect(restored.tianDiPan.tianPan).toHaveLength(12);
  });

  it('serialize → deserialize 双向一致', () => {
    const data = serializePan(pan);
    const restored = deserializePan(data);
    // 四课
    for (let i = 0; i < 4; i++) {
      expect(restored.siKe[i].upperGod).toBe(pan.siKe[i].upperGod);
      expect(restored.siKe[i].lowerGod).toBe(pan.siKe[i].lowerGod);
      expect(restored.siKe[i].relation).toBe(pan.siKe[i].relation);
    }
    // 三传
    for (let i = 0; i < 3; i++) {
      expect(restored.sanChuan[i].branch).toBe(pan.sanChuan[i].branch);
      expect(restored.sanChuan[i].tianJiang).toBe(pan.sanChuan[i].tianJiang);
      expect(restored.sanChuan[i].liuQin).toBe(pan.sanChuan[i].liuQin);
      expect(restored.sanChuan[i].dunGan).toBe(pan.sanChuan[i].dunGan);
    }
    // 天将
    expect(restored.tianJiang.guiRenBranch).toBe(pan.tianJiang.guiRenBranch);
    expect(restored.tianJiang.direction).toBe(pan.tianJiang.direction);
  });

  it('deserializePan 拒绝无效 dayGanZhi', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, dayGanZhi: '' })).toThrow('dayGanZhi');
  });

  it('deserializePan 拒绝无效 shiZhi', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, shiZhi: '无效' })).toThrow('时支');
  });

  it('deserializePan 拒绝无效 siKe 长度', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, siKe: data.siKe.slice(0, 3) })).toThrow('siKe');
  });

  it('deserializePan 拒绝无效 sanChuan 长度', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, sanChuan: data.sanChuan.slice(0, 2) })).toThrow('sanChuan');
  });

  it('deserializePan 拒绝缺失 tianDiPan', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, tianDiPan: undefined })).toThrow('tianDiPan');
  });

  it('deserializePan 拒绝缺失 tianJiang', () => {
    const data = serializePan(pan);
    expect(() => deserializePan({ ...data, tianJiang: undefined })).toThrow('tianJiang');
  });
});
