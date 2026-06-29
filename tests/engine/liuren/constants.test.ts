/**
 * Phase 0 常量表测试
 * 验证所有常量表的正确性
 */

import { describe, it, expect } from 'vitest';
import {
  KE_MATRIX,
  SHENG_MATRIX,
  CHONG_MAP,
  XING_MAP,
  HE_MAP,
  HAI_MAP,
  SAN_HE,
  RI_MA_MAP,
  GAN_HE,
  GAN_HE_WUXING,
  GAN_YINYANG,
  isKe,
  isSheng,
  isChong,
  isXing,
  isHe,
  isHai,
  getSanHe,
  isYangGan,
  isYangBranch,
  nextBranch,
  prevBranch,
} from '../../../src/engine/liuren/constants.js';
import {
  GAN_JI_GONG,
  BRANCH_WUXING,
  ALL_BRANCHES,
  ALL_GANS,
} from '../../../src/engine/liuren/types.js';
import type { } from '../../../src/engine/liuren/types.js';

describe('Phase 0: 常量表', () => {

  // ========== KE_MATRIX 五行相克 ==========
  describe('KE_MATRIX 五行相克矩阵', () => {
    it('五行相克关系正确', () => {
      expect(KE_MATRIX['木']['土']).toBe(true);
      expect(KE_MATRIX['土']['水']).toBe(true);
      expect(KE_MATRIX['水']['火']).toBe(true);
      expect(KE_MATRIX['火']['金']).toBe(true);
      expect(KE_MATRIX['金']['木']).toBe(true);
    });

    it('五行不相克关系正确', () => {
      expect(KE_MATRIX['木']['木']).toBe(false);
      expect(KE_MATRIX['木']['火']).toBe(false);
      expect(KE_MATRIX['火']['木']).toBe(false);
      expect(KE_MATRIX['土']['金']).toBe(false);
    });

    it('isKe 辅助函数正确', () => {
      expect(isKe('木', '土')).toBe(true);
      expect(isKe('土', '木')).toBe(false);
    });
  });

  // ========== SHENG_MATRIX 五行相生 ==========
  describe('SHENG_MATRIX 五行相生矩阵', () => {
    it('五行相生关系正确', () => {
      expect(SHENG_MATRIX['木']['火']).toBe(true);
      expect(SHENG_MATRIX['火']['土']).toBe(true);
      expect(SHENG_MATRIX['土']['金']).toBe(true);
      expect(SHENG_MATRIX['金']['水']).toBe(true);
      expect(SHENG_MATRIX['水']['木']).toBe(true);
    });

    it('isSheng 辅助函数正确', () => {
      expect(isSheng('木', '火')).toBe(true);
      expect(isSheng('火', '木')).toBe(false);
    });
  });

  // ========== CHONG_MAP 地支六冲 ==========
  describe('CHONG_MAP 地支六冲', () => {
    it('六冲关系正确', () => {
      expect(CHONG_MAP['子']).toBe('午');
      expect(CHONG_MAP['午']).toBe('子');
      expect(CHONG_MAP['丑']).toBe('未');
      expect(CHONG_MAP['寅']).toBe('申');
      expect(CHONG_MAP['卯']).toBe('酉');
      expect(CHONG_MAP['辰']).toBe('戌');
      expect(CHONG_MAP['巳']).toBe('亥');
    });

    it('六冲对称性', () => {
      ALL_BRANCHES.forEach(b => {
        expect(CHONG_MAP[CHONG_MAP[b]]).toBe(b);
      });
    });

    it('isChong 辅助函数正确', () => {
      expect(isChong('子', '午')).toBe(true);
      expect(isChong('子', '丑')).toBe(false);
    });
  });

  // ========== XING_MAP 地支相刑 ==========
  describe('XING_MAP 地支相刑', () => {
    it('三刑关系正确', () => {
      // 无恩之刑
      expect(XING_MAP['寅']).toBe('巳');
      expect(XING_MAP['巳']).toBe('申');
      expect(XING_MAP['申']).toBe('寅');
      // 恃势之刑
      expect(XING_MAP['丑']).toBe('戌');
      expect(XING_MAP['戌']).toBe('未');
      expect(XING_MAP['未']).toBe('丑');
      // 无礼之刑
      expect(XING_MAP['子']).toBe('卯');
      expect(XING_MAP['卯']).toBe('子');
    });

    it('自刑关系正确', () => {
      expect(XING_MAP['辰']).toBe('辰');
      expect(XING_MAP['午']).toBe('午');
      expect(XING_MAP['酉']).toBe('酉');
      expect(XING_MAP['亥']).toBe('亥');
    });

    it('isXing 辅助函数正确', () => {
      expect(isXing('寅', '巳')).toBe(true);
      expect(isXing('辰', '辰')).toBe(true);
      expect(isXing('子', '寅')).toBe(false);
    });
  });

  // ========== HE_MAP 地支六合 ==========
  describe('HE_MAP 地支六合', () => {
    it('六合关系正确', () => {
      expect(HE_MAP['子']).toBe('丑');
      expect(HE_MAP['丑']).toBe('子');
      expect(HE_MAP['寅']).toBe('亥');
      expect(HE_MAP['亥']).toBe('寅');
      expect(HE_MAP['卯']).toBe('戌');
      expect(HE_MAP['辰']).toBe('酉');
      expect(HE_MAP['巳']).toBe('申');
      expect(HE_MAP['午']).toBe('未');
    });

    it('六合对称性', () => {
      ALL_BRANCHES.forEach(b => {
        expect(HE_MAP[HE_MAP[b]]).toBe(b);
      });
    });

    it('isHe 辅助函数正确', () => {
      expect(isHe('子', '丑')).toBe(true);
      expect(isHe('子', '寅')).toBe(false);
    });
  });

  // ========== HAI_MAP 地支六害 ==========
  describe('HAI_MAP 地支六害', () => {
    it('六害关系正确', () => {
      expect(HAI_MAP['子']).toBe('未');
      expect(HAI_MAP['未']).toBe('子');
      expect(HAI_MAP['丑']).toBe('午');
      expect(HAI_MAP['午']).toBe('丑');
      expect(HAI_MAP['寅']).toBe('巳');
      expect(HAI_MAP['巳']).toBe('寅');
      expect(HAI_MAP['卯']).toBe('辰');
      expect(HAI_MAP['辰']).toBe('卯');
      expect(HAI_MAP['申']).toBe('亥');
      expect(HAI_MAP['亥']).toBe('申');
      expect(HAI_MAP['酉']).toBe('戌');
      expect(HAI_MAP['戌']).toBe('酉');
    });

    it('六害对称性', () => {
      ALL_BRANCHES.forEach(b => {
        expect(HAI_MAP[HAI_MAP[b]]).toBe(b);
      });
    });

    it('isHai 辅助函数正确', () => {
      expect(isHai('子', '未')).toBe(true);
      expect(isHai('子', '午')).toBe(false);
    });
  });

  // ========== SAN_HE 地支三合 ==========
  describe('SAN_HE 地支三合局', () => {
    it('水局: 申子辰', () => {
      const [a, b, wx] = getSanHe('申');
      expect([a, b].sort()).toEqual(['子', '辰'].sort());
      expect(wx).toBe('水');
    });

    it('火局: 寅午戌', () => {
      const [a, b, wx] = getSanHe('午');
      expect([a, b].sort()).toEqual(['寅', '戌'].sort());
      expect(wx).toBe('火');
    });

    it('金局: 巳酉丑', () => {
      const [a, b, wx] = getSanHe('酉');
      expect([a, b].sort()).toEqual(['巳', '丑'].sort());
      expect(wx).toBe('金');
    });

    it('木局: 亥卯未', () => {
      const [a, b, wx] = getSanHe('卯');
      expect([a, b].sort()).toEqual(['亥', '未'].sort());
      expect(wx).toBe('木');
    });

    it('每个地支都有三合映射', () => {
      ALL_BRANCHES.forEach(b => {
        expect(SAN_HE[b]).toBeDefined();
        expect(SAN_HE[b]).toHaveLength(3);
      });
    });
  });

  // ========== RI_MA_MAP 驿马 ==========
  describe('RI_MA_MAP 驿马', () => {
    it('驿马关系正确', () => {
      expect(RI_MA_MAP['申']).toBe('寅');
      expect(RI_MA_MAP['子']).toBe('寅');
      expect(RI_MA_MAP['辰']).toBe('寅');
      expect(RI_MA_MAP['亥']).toBe('巳');
      expect(RI_MA_MAP['寅']).toBe('申');
      expect(RI_MA_MAP['巳']).toBe('亥');
    });

    it('每个日支都有驿马', () => {
      ALL_BRANCHES.forEach(b => {
        expect(RI_MA_MAP[b]).toBeDefined();
      });
    });
  });

  // ========== GAN_HE 天干五合 ==========
  describe('GAN_HE 天干五合', () => {
    it('天干五合关系正确', () => {
      expect(GAN_HE['甲']).toBe('己');
      expect(GAN_HE['己']).toBe('甲');
      expect(GAN_HE['乙']).toBe('庚');
      expect(GAN_HE['丙']).toBe('辛');
      expect(GAN_HE['丁']).toBe('壬');
      expect(GAN_HE['戊']).toBe('癸');
    });

    it('天干五合对称性', () => {
      ALL_GANS.forEach(g => {
        expect(GAN_HE[GAN_HE[g]]).toBe(g);
      });
    });

    it('GAN_HE_WUXING 化五行正确', () => {
      expect(GAN_HE_WUXING['甲']).toBe('土'); // 甲己合化土
      expect(GAN_HE_WUXING['乙']).toBe('金'); // 乙庚合化金
      expect(GAN_HE_WUXING['丙']).toBe('水'); // 丙辛合化水
      expect(GAN_HE_WUXING['丁']).toBe('木'); // 丁壬合化木
      expect(GAN_HE_WUXING['戊']).toBe('火'); // 戊癸合化火
    });
  });

  // ========== GAN_YINYANG 天干阴阳 ==========
  describe('GAN_YINYANG 天干阴阳', () => {
    it('阳干: 甲丙戊庚壬', () => {
      expect(GAN_YINYANG['甲']).toBe('阳');
      expect(GAN_YINYANG['丙']).toBe('阳');
      expect(GAN_YINYANG['戊']).toBe('阳');
      expect(GAN_YINYANG['庚']).toBe('阳');
      expect(GAN_YINYANG['壬']).toBe('阳');
    });

    it('阴干: 乙丁己辛癸', () => {
      expect(GAN_YINYANG['乙']).toBe('阴');
      expect(GAN_YINYANG['丁']).toBe('阴');
      expect(GAN_YINYANG['己']).toBe('阴');
      expect(GAN_YINYANG['辛']).toBe('阴');
      expect(GAN_YINYANG['癸']).toBe('阴');
    });

    it('isYangGan 辅助函数正确', () => {
      expect(isYangGan('甲')).toBe(true);
      expect(isYangGan('乙')).toBe(false);
    });
  });

  // ========== isYangBranch ==========
  describe('isYangBranch', () => {
    it('阳支: 子寅辰午申戌', () => {
      expect(isYangBranch('子')).toBe(true);
      expect(isYangBranch('寅')).toBe(true);
      expect(isYangBranch('辰')).toBe(true);
      expect(isYangBranch('午')).toBe(true);
      expect(isYangBranch('申')).toBe(true);
      expect(isYangBranch('戌')).toBe(true);
    });

    it('阴支: 丑卯巳未酉亥', () => {
      expect(isYangBranch('丑')).toBe(false);
      expect(isYangBranch('卯')).toBe(false);
      expect(isYangBranch('巳')).toBe(false);
      expect(isYangBranch('未')).toBe(false);
      expect(isYangBranch('酉')).toBe(false);
      expect(isYangBranch('亥')).toBe(false);
    });
  });

  // ========== nextBranch / prevBranch ==========
  describe('nextBranch / prevBranch', () => {
    it('nextBranch 步进1', () => {
      expect(nextBranch('子')).toBe('丑');
      expect(nextBranch('亥')).toBe('子'); // 循环
    });

    it('nextBranch 步进多步', () => {
      expect(nextBranch('子', 3)).toBe('卯');
      expect(nextBranch('子', 12)).toBe('子'); // 绕一圈
    });

    it('prevBranch 逆行1', () => {
      expect(prevBranch('子')).toBe('亥');
      expect(prevBranch('丑')).toBe('子');
    });

    it('prevBranch 逆行多步', () => {
      expect(prevBranch('子', 3)).toBe('酉');
      expect(prevBranch('子', 12)).toBe('子'); // 绕一圈
    });
  });

  // ========== GAN_JI_GONG 日干寄宫（来自types.ts） ==========
  describe('GAN_JI_GONG 日干寄宫', () => {
    it('天干寄宫映射完整', () => {
      expect(GAN_JI_GONG['甲']).toBe('寅');
      expect(GAN_JI_GONG['乙']).toBe('辰');
      expect(GAN_JI_GONG['丙']).toBe('巳');
      expect(GAN_JI_GONG['丁']).toBe('未');
      expect(GAN_JI_GONG['戊']).toBe('巳');
      expect(GAN_JI_GONG['己']).toBe('未');
      expect(GAN_JI_GONG['庚']).toBe('申');
      expect(GAN_JI_GONG['辛']).toBe('戌');
      expect(GAN_JI_GONG['壬']).toBe('亥');
      expect(GAN_JI_GONG['癸']).toBe('丑');
    });
  });

  // ========== BRANCH_WUXING 地支五行 ==========
  describe('BRANCH_WUXING 地支五行', () => {
    it('五行归属正确', () => {
      expect(BRANCH_WUXING['寅']).toBe('木');
      expect(BRANCH_WUXING['卯']).toBe('木');
      expect(BRANCH_WUXING['巳']).toBe('火');
      expect(BRANCH_WUXING['午']).toBe('火');
      expect(BRANCH_WUXING['申']).toBe('金');
      expect(BRANCH_WUXING['酉']).toBe('金');
      expect(BRANCH_WUXING['亥']).toBe('水');
      expect(BRANCH_WUXING['子']).toBe('水');
      expect(BRANCH_WUXING['辰']).toBe('土');
      expect(BRANCH_WUXING['戌']).toBe('土');
      expect(BRANCH_WUXING['丑']).toBe('土');
      expect(BRANCH_WUXING['未']).toBe('土');
    });
  });
});
