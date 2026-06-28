/**
 * 神煞收集器
 *
 * 从 shensha-rules.json 读取规则，计算年/月/日/时维度的神煞
 * 输出 ≥30 个神煞结果
 */

import type { Branch, Gan, ShenShaItem, ShenShaCategory } from './types.js';
import { GAN_JI_GONG } from './types.js';
import shenshaRules from '../../data/liuren/shensha-rules.json' with { type: 'json' };
import { RI_MA_MAP, HE_MAP, GAN_HE, CHONG_MAP } from './constants.js';

/** 神煞规则条目 */
interface ShenShaRule {
  name: string;
  category: ShenShaCategory;
  dimension: string;
  description: string;
  rules: {
    type: string;
    mapping?: Record<string, string | string[]>;
    branch?: string;
    offset?: number;
    null_map?: Record<string, string[]>;
    source?: string;
    method?: string;
    note?: string;
  };
}

/**
 * 收集所有神煞
 *
 * @param yearGan 年干
 * @param yearZhi 年支
 * @param monthZhi 月支
 * @param dayGan 日干
 * @param dayZhi 日支
 * @param shiZhi 时支
 * @returns 神煞列表
 */
export function collectShenSha(
  yearGan: Gan,
  yearZhi: Branch,
  monthZhi: Branch,
  dayGan: Gan,
  dayZhi: Branch,
  shiZhi: Branch,
): ShenShaItem[] {
  const result: ShenShaItem[] = [];
  const rules = shenshaRules as ShenShaRule[];

  for (const rule of rules) {
    try {
      const items = resolveRule(rule, {
        yearGan, yearZhi, monthZhi, dayGan, dayZhi, shiZhi,
      });
      result.push(...items);
    } catch {
      // 跳过无法解析的规则
    }
  }

  return result;
}

/**
 * 解析单个神煞规则
 */
function resolveRule(
  rule: ShenShaRule,
  ctx: {
    yearGan: Gan;
    yearZhi: Branch;
    monthZhi: Branch;
    dayGan: Gan;
    dayZhi: Branch;
    shiZhi: Branch;
  },
): ShenShaItem[] {
  const items: ShenShaItem[] = [];
  const { type, mapping } = rule.rules;

  switch (type) {
    case 'gan_branch_lookup': {
      // 日干/年干查表
      let key: string = ctx.dayGan;
      if (rule.dimension === '年') key = ctx.yearGan;

      if (mapping && mapping[key]) {
        const branches = Array.isArray(mapping[key]) ? mapping[key] as string[] : [mapping[key] as string];
        branches.forEach(b => {
          items.push({
            name: rule.name,
            category: rule.category,
            branch: b as Branch,
          });
        });
      }
      break;
    }

    case 'ri_zhi_lookup': {
      // 日支查表
      const key = ctx.dayZhi;
      if (mapping && mapping[key]) {
        const branch = mapping[key] as string;
        items.push({
          name: rule.name,
          category: rule.category,
          branch: branch as Branch,
        });
      }
      break;
    }

    case 'month_branch_lookup': {
      // 月支查表
      const key = ctx.monthZhi;
      if (mapping && mapping[key]) {
        const value = mapping[key] as string;
        // 如果映射值是天干，取该天干寄宫
        if (value.length === 1 && '甲乙丙丁戊己庚辛壬癸'.includes(value)) {
          const jiGong = GAN_JI_GONG[value as Gan];
          items.push({
            name: rule.name,
            category: rule.category,
            branch: jiGong,
          });
        } else {
          items.push({
            name: rule.name,
            category: rule.category,
            branch: value as Branch,
          });
        }
      }
      break;
    }

    case 'year_branch_chong': {
      // 太岁冲位
      items.push({
        name: rule.name,
        category: rule.category,
        branch: CHONG_MAP[ctx.yearZhi],
      });
      break;
    }

    case 'year_branch_offset': {
      // 年支偏移
      const offset = rule.rules.offset || 0;
      const branches: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
      const idx = branches.indexOf(ctx.yearZhi);
      const targetIdx = ((idx + offset) % 12 + 12) % 12;
      items.push({
        name: rule.name,
        category: rule.category,
        branch: branches[targetIdx],
      });
      break;
    }

    case 'fixed_branch': {
      // 固定地支
      if (rule.rules.branch) {
        items.push({
          name: rule.name,
          category: rule.category,
          branch: rule.rules.branch as Branch,
        });
      }
      break;
    }

    case 'jiazi_cycle_null': {
      // 空亡：根据日干支所在旬的空亡地支
      const ganOrder: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhiOrder: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      const dayGanIdx = ganOrder.indexOf(ctx.dayGan);
      const dayZhiIdx = zhiOrder.indexOf(ctx.dayZhi);
      // 旬首的地支偏移
      const xunStartZhiIdx = (dayZhiIdx - dayGanIdx + 12) % 12;

      // 空亡 = 旬中最后两个地支（旬首+10 和 旬首+11）
      const null1 = zhiOrder[(xunStartZhiIdx + 10) % 12];
      const null2 = zhiOrder[(xunStartZhiIdx + 11) % 12];

      items.push({
        name: rule.name,
        category: rule.category,
        branch: null1,
      });
      items.push({
        name: rule.name,
        category: rule.category,
        branch: null2,
      });
      break;
    }

    default:
      break;
  }

  return items;
}
