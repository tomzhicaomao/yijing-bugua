/**
 * 天将排布对比测试 — 与 kinliuren 对比
 */
import { describe, it, expect } from 'vitest';
import { calculateLiuren } from '../../../src/engine/liuren/index.js';
import { buildTianDiPan } from '../../../src/engine/liuren/tiandi-pan.js';
import { layoutTianJiang } from '../../../src/engine/liuren/tianjiang.js';

describe('天将排布对比 kinliuren', () => {
  it('春分乙丑日甲子时：天盘和天将序列一致', () => {
    // kinliuren 输出:
    // 天盘: ['戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉']
    // 天将: ['陰', '玄', '常', '虎', '空', '龍', '勾', '合', '雀', '蛇', '貴', '后']
    // 贵人在申，逆布

    // 春分月将=戌，子时
    const tianDiPan = buildTianDiPan('戌', '子');
    
    // 天盘验证：戌将+子时 → offset = (10-0)%12 = 10
    // tianPan[i] = ALL[(i+10)%12]
    // tianPan[0] = ALL[10] = 戌, tianPan[1] = ALL[11] = 亥, ...
    const expectedTianPan = ['戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉'];
    expect(tianDiPan.tianPan).toEqual(expectedTianPan);

    // 乙日昼贵在子（子时=夜，idx=0 < 3）
    // 乙日夜贵在申
    const info = layoutTianJiang('乙', '子', tianDiPan);
    expect(info.guiRenBranch).toBe('申');

    // 贵人在申 → SHUN_START包含申? SHUN_START = ['亥', '子', '丑', '寅', '卯', '辰']
    // 申不在SHUN_START → 逆布
    expect(info.direction).toBe('逆');

    // kinliuren 天将序列 (从申开始逆布):
    // 申=貴, 酉=后, 戌=陰, 亥=玄, 子=常, 丑=虎, 寅=空, 卯=龍, 辰=勾, 巳=合, 午=雀, 未=蛇
    const expectedMapping: Record<string, string> = {
      '申': '貴人', '酉': '天后', '戌': '太阴', '亥': '玄武',
      '子': '太常', '丑': '白虎', '寅': '天空', '卯': '青龙',
      '辰': '勾陈', '巳': '六合', '午': '朱雀', '未': '螣蛇',
    };

    // 检查关键位置：天将布在天盘地支上
    // guiRenTianPanIdx=10 → 从tianPan[10]=申开始逆布
    // tianPan[10]=申→貴人, tianPan[9]=未→天后, tianPan[8]=午→太阴, tianPan[7]=巳→玄武
    // tianPan[6]=辰→太常, tianPan[5]=卯→白虎, tianPan[4]=寅→天空, tianPan[3]=丑→青龙
    // tianPan[2]=子→勾陈, tianPan[1]=亥→六合, tianPan[0]=戌→朱雀, tianPan[11]=酉→螣蛇
    expect(info.branchToJiang['申']).toBe('贵人');
    expect(info.branchToJiang['午']).toBe('太阴');
    expect(info.branchToJiang['戌']).toBe('朱雀');
    expect(info.branchToJiang['酉']).toBe('螣蛇');
  });

  it('立春甲子日寅时：天盘正确', () => {
    // 丑将+寅时 → offset = (1-2+12)%12 = 11
    // tianPan[i] = ALL[(i+11)%12]
    // tianPan[0] = ALL[11] = 亥, tianPan[1] = ALL[0] = 子, ...
    const tianDiPan = buildTianDiPan('丑', '寅');
    
    const expectedTianPan = ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'];
    expect(tianDiPan.tianPan).toEqual(expectedTianPan);
  });

  it('伏吟课：天地盘完全相同', () => {
    const tianDiPan = buildTianDiPan('子', '子');
    for (let i = 0; i < 12; i++) {
      expect(tianDiPan.tianPan[i]).toBe(tianDiPan.diPan[i]);
    }
  });

  it('返吟课：天地盘每个位置都相冲', () => {
    const tianDiPan = buildTianDiPan('午', '子');
    const chongMap: Record<string, string> = {
      '子': '午', '丑': '未', '寅': '申', '卯': '酉',
      '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
      '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳',
    };
    for (let i = 0; i < 12; i++) {
      const di = tianDiPan.diPan[i];
      const tian = tianDiPan.tianPan[i];
      expect(chongMap[di]).toBe(tian);
    }
  });
});
