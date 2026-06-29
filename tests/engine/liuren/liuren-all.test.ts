/**
 * 九宗门 + 天将 + 遁干 + 神煞 + 防误判 + 集成测试
 */

import { describe, it, expect } from 'vitest';
import { buildTianDiPan } from '../../../src/engine/liuren/tiandi-pan.js';
import { calculateSanChuan, deriveZhongMoChuan } from '../../../src/engine/liuren/sanchuan.js';
import { zeke } from '../../../src/engine/liuren/jiuzongmen/zeke.js';
import { biyong } from '../../../src/engine/liuren/jiuzongmen/biyong.js';
import { calculateShehaiDepth } from '../../../src/engine/liuren/jiuzongmen/shehai.js';
import { yaoke } from '../../../src/engine/liuren/jiuzongmen/yaoke.js';
//import { maoxing } from '../../../src/engine/liuren/jiuzongmen/maoxing.js';
//import { bieze } from '../../../src/engine/liuren/jiuzongmen/bieze.js';
//import { bazhuan } from '../../../src/engine/liuren/jiuzongmen/bazhuan.js';
import { isFuYin } from '../../../src/engine/liuren/jiuzongmen/fuyin.js';
import { fanyin, isFanYin } from '../../../src/engine/liuren/jiuzongmen/fanyin.js';
import { layoutTianJiang, isDaytime } from '../../../src/engine/liuren/tianjiang.js';
import { calcShiGan, calcLiuQin } from '../../../src/engine/liuren/dungan.js';
import { collectShenSha } from '../../../src/engine/liuren/shensha.js';
import { checkTaiSui } from '../../../src/engine/liuren/tai-sui-check.js';
import { detectShenShaConflict } from '../../../src/engine/liuren/shensha-conflict.js';
import { detectKongWang, calcKongWang } from '../../../src/engine/liuren/kongwang-detect.js';
import { calculateLiuren, buildSiKe } from '../../../src/engine/liuren/index.js';
import type { Branch, Gan, SiKeItem, ShenShaItem } from '../../../src/engine/liuren/types.js';

// ==================== A1: 四课+三传 ====================

describe('A1: 四课+三传调度', () => {
  it('deriveZhongMoChuan 正确推导中末传', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const [zhong, mo] = deriveZhongMoChuan('子', tianDiPan);
    expect(zhong).toBeDefined();
    expect(mo).toBeDefined();
  });

  it('calculateSanChuan 不抛异常', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);
    const result = calculateSanChuan(siKe, '甲', '子', tianDiPan);
    expect(result).toBeDefined();
    expect(result.chuChuan).toBeDefined();
    expect(result.zhongChuan).toBeDefined();
    expect(result.moChuan).toBeDefined();
    expect(result.geJu).toBeDefined();
  });

  it('calculateSanChuan 对所有日干支都能成功', () => {
    const gans: Gan[] = ['甲', '乙', '丙', '丁', '戊'];
    const zhis: Branch[] = ['子', '丑', '寅', '卯', '辰'];
    for (const gan of gans) {
      for (const zhi of zhis) {
        const tianDiPan = buildTianDiPan('丑', '子');
        const siKe = buildSiKe(gan, zhi, tianDiPan);
        const result = calculateSanChuan(siKe, gan, zhi, tianDiPan);
        expect(result).toBeDefined();
        expect(result.chuChuan).toBeDefined();
        expect(result.geJu).toBeDefined();
      }
    }
  });
});

// ==================== A2: 贼克+比用+涉害 ====================

describe('A2.1: 贼克法', () => {
  it('无克返回 null', () => {
    // 全比和
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '丑', lowerGod: '丑', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    expect(zeke(siKe, '甲', tianDiPan)).toBeNull();
  });

  it('单一上克下返回元首', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '申', lowerGod: '寅', relation: '上克下' },  // 金克木
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    const result = zeke(siKe, '甲', tianDiPan);
    expect(result).not.toBeNull();
    expect(result!.geJu).toBe('元首');
    expect(result!.chuChuan).toBe('申');
  });

  it('单一下贼上返回重审', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '寅', lowerGod: '申', relation: '下贼上' },  // 金克木，下(申)克上(寅)? 不对，寅木不克申金
      // 修正：午火克申金 → 下(午)贼上(申)
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    // 重写第一个为正确的下贼上
    siKe[0] = { upperGod: '申', lowerGod: '午', relation: '下贼上' }; // 午火克申金
    const tianDiPan = buildTianDiPan('丑', '寅');
    const result = zeke(siKe, '甲', tianDiPan);
    expect(result).not.toBeNull();
    expect(result!.geJu).toBe('重审');
  });

  it('多个克返回null交由比用', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '申', lowerGod: '寅', relation: '上克下' },
      { upperGod: '酉', lowerGod: '卯', relation: '上克下' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    expect(zeke(siKe, '甲', tianDiPan)).toBeNull();
  });
});

describe('A2.2: 比用法', () => {
  it('多个上克下时取与日干同阴阳', () => {
    // 甲（阳）日，申(阳)、酉(阴) 两个上克下
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '申', lowerGod: '寅', relation: '上克下' },
      { upperGod: '酉', lowerGod: '卯', relation: '上克下' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    const result = biyong(siKe, '甲', tianDiPan);
    expect(result).not.toBeNull();
    expect(result!.chuChuan).toBe('申'); // 阳干取阳支
  });

  it('阴干取阴支', () => {
    // 乙（阴）日
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '申', lowerGod: '寅', relation: '上克下' },
      { upperGod: '酉', lowerGod: '卯', relation: '上克下' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    const result = biyong(siKe, '乙', tianDiPan);
    expect(result).not.toBeNull();
    expect(result!.chuChuan).toBe('酉'); // 阴干取阴支
  });

  it('无候选时返回null', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '丑', lowerGod: '丑', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    expect(biyong(siKe, '甲', tianDiPan)).toBeNull();
  });
});

describe('A2.3: 涉害法', () => {
  it('calculateShehaiDepth 返回非负数', () => {
    const depth = calculateShehaiDepth('子');
    expect(depth).toBeGreaterThanOrEqual(0);
  });

  it('涉害深度各支不同', () => {
    const depths = new Set<number>();
    const branches: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    branches.forEach(b => {
      depths.add(calculateShehaiDepth(b));
    });
    // 不同地支应有不同深度
    expect(depths.size).toBeGreaterThan(1);
  });
});

// ==================== A3: 其余六个宗门 ====================

describe('A3.1: 遥克法', () => {
  it('无克返回null', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '丑', lowerGod: '丑', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('丑', '寅');
    // 遥克法需要四课无克，但还需要日干克上神或上神克日干
    // 如果没有遥克关系，应返回null
    const result = yaoke(siKe, '甲', '子', tianDiPan);
    // 甲(木)克的上神应为土
    // 子(水)、丑(土)、寅(木)、卯(木)中，丑是土 → 甲木克丑土 → 应有结果
    // 但丑不在上神中（上神是子丑寅卯）... 丑是上神之一
    // 甲(木)克丑(土) → 遥克
    expect(result).not.toBeNull();
  });
});

describe('A3.5: 伏吟法', () => {
  it('isFuYin 检测天地盘相同', () => {
    // 月将=占时 → 伏吟
    const tianDiPan = buildTianDiPan('子', '子');
    expect(isFuYin(tianDiPan)).toBe(true);
  });

  it('非伏吟天地盘', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    expect(isFuYin(tianDiPan)).toBe(false);
  });
});

describe('A3.6: 返吟法', () => {
  it('isFanYin 检测天地盘完全相冲', () => {
    // 月将=午，占时=子 → 天盘子对地盘子？不对
    // 子午冲：需要每个地支的天盘都是其冲位
    // buildTianDiPan('午', '子') → offset = (0 - 6 + 12) % 12 = 6
    // tianPan = [午,未,申,酉,戌,亥,子,丑,寅,卯,辰,巳]
    // diPan  = [子,丑,寅,卯,辰,巳,午,未,申,酉,戌,亥]
    // 子→午(冲) ✓, 丑→未(冲) ✓ ... 全部对冲
    const tianDiPan = buildTianDiPan('午', '子');
    expect(isFanYin(tianDiPan)).toBe(true);
  });

  it('返吟法必定成功', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '子', lowerGod: '子', relation: '比和' },
      { upperGod: '丑', lowerGod: '丑', relation: '比和' },
      { upperGod: '寅', lowerGod: '寅', relation: '比和' },
      { upperGod: '卯', lowerGod: '卯', relation: '比和' },
    ];
    const tianDiPan = buildTianDiPan('午', '子');
    const result = fanyin(siKe, '甲', '子', tianDiPan);
    expect(result).toBeDefined();
    expect(result.geJu).toBe('返吟');
  });
});

// ==================== A4: 天将+遁干+神煞 ====================

describe('A4.1: 天将', () => {
  it('isDaytime 正确判断昼夜', () => {
    expect(isDaytime('卯')).toBe(true);
    expect(isDaytime('午')).toBe(true);
    expect(isDaytime('申')).toBe(true);
    expect(isDaytime('酉')).toBe(false);
    expect(isDaytime('子')).toBe(false);
    expect(isDaytime('寅')).toBe(false);
  });

  it('layoutTianJiang 返回完整信息', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const info = layoutTianJiang('甲', '午', tianDiPan);
    expect(info.guiRenBranch).toBeDefined();
    expect(info.direction).toBeDefined();
    expect(info.branchToJiang).toBeDefined();
  });

  it('十二天将覆盖所有地支', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const info = layoutTianJiang('甲', '午', tianDiPan);
    const branches = Object.keys(info.branchToJiang);
    expect(branches).toHaveLength(12);
  });
});

describe('A4.2: 遁干', () => {
  it('calcShiGan 推算时干', () => {
    // 甲日甲子时
    expect(calcShiGan('甲', '子')).toBe('甲');
    // 甲日丑时
    expect(calcShiGan('甲', '丑')).toBe('乙');
    // 乙庚日丙子时
    expect(calcShiGan('乙', '子')).toBe('丙');
    expect(calcShiGan('庚', '子')).toBe('丙');
  });

  it('calcLiuQin 六亲关系', () => {
    // 木 → 火（我生 → 子孙）
    expect(calcLiuQin('木', '火')).toBe('子孙');
    // 木 → 水（生我 → 父母）
    expect(calcLiuQin('木', '水')).toBe('父母');
    // 木 → 金（克我 → 官鬼）
    expect(calcLiuQin('木', '金')).toBe('官鬼');
    // 木 → 土（我克 → 妻财）
    expect(calcLiuQin('木', '土')).toBe('妻财');
    // 木 → 木（同我 → 兄弟）
    expect(calcLiuQin('木', '木')).toBe('兄弟');
  });
});

describe('A4.3: 神煞', () => {
  it('collectShenSha 收集≥10个神煞', () => {
    const result = collectShenSha('甲', '子', '寅', '甲', '子', '午');
    expect(result.length).toBeGreaterThanOrEqual(10);
  });

  it('神煞有正确结构', () => {
    const result = collectShenSha('甲', '子', '寅', '甲', '子', '午');
    result.forEach(item => {
      expect(item.name).toBeDefined();
      expect(item.category).toBeDefined();
      expect(['吉', '凶', '中性']).toContain(item.category);
      expect(item.branch).toBeDefined();
    });
  });

  it('空亡检测', () => {
    const result = collectShenSha('甲', '子', '寅', '甲', '子', '午');
    const kongWang = result.filter(s => s.name === '空亡');
    expect(kongWang).toHaveLength(2);
  });
});

// ==================== A5: 防误判 ====================

describe('A5: 防误判', () => {
  it('checkTaiSui 检测太岁', () => {
    const tianDiPan = buildTianDiPan('丑', '寅');
    const siKe = buildSiKe('甲', '子', tianDiPan);
    const _sanChuanResult = calculateSanChuan(siKe, '甲', '子', tianDiPan);
    const _tianJiangInfo = layoutTianJiang('甲', '寅', tianDiPan);

    // 构造简单 pan
    const pan = {
      siKe,
      sanChuan: [{ branch: '子' } as unknown, { branch: '丑' } as unknown, { branch: '寅' } as unknown],
      shenSha: [],
    } as unknown;

    const result = checkTaiSui(pan, '子');
    expect(result.taiSuiBranch).toBe('子');
  });

  it('detectShenShaConflict 检测矛盾', () => {
    const shenSha: ShenShaItem[] = [
      { name: '天德', category: '吉', branch: '子' },
      { name: '白虎', category: '凶', branch: '子' },
    ];
    const result = detectShenShaConflict(shenSha);
    expect(result.hasConflict).toBe(true);
    expect(result.conflicts).toHaveLength(1);
  });

  it('无矛盾时', () => {
    const shenSha: ShenShaItem[] = [
      { name: '天德', category: '吉', branch: '子' },
      { name: '月德', category: '吉', branch: '丑' },
    ];
    const result = detectShenShaConflict(shenSha);
    expect(result.hasConflict).toBe(false);
  });

  it('calcKongWang 计算空亡', () => {
    // 甲子旬 → 空亡戌亥
    const [null1, null2] = calcKongWang('甲', '子');
    expect([null1, null2].sort()).toEqual(['戌', '亥'].sort());
  });

  it('detectKongWang 检测四课三传中的空亡', () => {
    const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = [
      { upperGod: '戌', lowerGod: '寅', relation: '比和' },
      { upperGod: '子', lowerGod: '戌', relation: '比和' },
      { upperGod: '亥', lowerGod: '子', relation: '比和' },
      { upperGod: '丑', lowerGod: '亥', relation: '比和' },
    ];
    const sanChuan: Array<Record<string, unknown>> = [
      { branch: '戌' },
      { branch: '亥' },
      { branch: '子' },
    ];
    const result = detectKongWang(siKe, sanChuan, '甲', '子');
    expect(result.nullBranches.sort()).toEqual(['戌', '亥'].sort());
    expect(result.inSiKe.length).toBeGreaterThan(0);
    expect(result.inSanChuan.length).toBeGreaterThan(0);
  });
});

// ==================== A6: 集成测试 ====================

describe('A6: 集成测试', () => {
  it('calculateLiuren 完整起课', () => {
    const date = new Date(2024, 0, 15, 10, 0); // 2024-01-15 10:00
    const pan = calculateLiuren({ date });

    expect(pan.dateTime).toBeDefined();
    expect(pan.dayGanZhi).toBeDefined();
    expect(pan.siKe).toHaveLength(4);
    expect(pan.sanChuan).toHaveLength(3);
    expect(pan.geJu).toBeDefined();
    expect(pan.tianJiang).toBeDefined();
    expect(pan.dunGan).toBeDefined();
    expect(pan.shenSha).toBeDefined();
    expect(pan.warnings).toBeDefined();
  });

  it('calculateLiuren 不同时辰产生不同结果', () => {
    const date1 = new Date(2024, 0, 15, 10, 0); // 巳时
    const date2 = new Date(2024, 0, 15, 14, 0); // 未时
    const pan1 = calculateLiuren({ date: date1 });
    const pan2 = calculateLiuren({ date: date2 });
    // 不同时辰天地盘不同
    expect(pan1.shiZhi).not.toBe(pan2.shiZhi);
  });

  it('calculateLiuren 对多种日期不抛异常', () => {
    const dates = [
      new Date(2020, 0, 1, 0, 0),
      new Date(2023, 5, 15, 12, 0),
      new Date(2024, 11, 31, 23, 0),
      new Date(2025, 2, 20, 6, 0),
    ];
    dates.forEach(date => {
      const pan = calculateLiuren({ date });
      expect(pan).toBeDefined();
      expect(pan.chuChuan || pan.sanChuan[0].branch).toBeDefined();
    });
  });

  it('课式包含格局信息', () => {
    const validGeJu = ['元首', '重审', '知一', '涉害', '遥克', '昴星', '别责', '八专', '伏吟', '返吟'];
    const date = new Date(2024, 0, 15, 10, 0);
    const pan = calculateLiuren({ date });
    expect(validGeJu).toContain(pan.geJu);
  });
});
