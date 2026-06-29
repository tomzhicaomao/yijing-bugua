/**
 * 神煞收集器
 *
 * 从 shensha-rules.json 读取规则，计算年/月/日/时维度的神煞
 * 输出 ≥30 个神煞结果
 */

import type { Branch, Gan, ShenShaItem, ShenShaCategory } from './types.js';
import { GAN_JI_GONG } from './types.js';
import shenshaRules from '../../data/liuren/shensha-rules.json' with { type: 'json' };
import { CHONG_MAP } from './constants.js';

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

/** 天干合映射：甲合己、乙合庚、丙合辛、丁合壬、戊合癸 */
const GAN_HE: Record<Gan, Gan> = {
  '甲': '己', '乙': '庚', '丙': '辛', '丁': '壬', '戊': '癸',
  '己': '甲', '庚': '乙', '辛': '丙', '壬': '丁', '癸': '戊',
};

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
      const items = resolveRule(rule, result, {
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
  resolved: ShenShaItem[],
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
      const key = ctx.monthZhi;
      if (mapping && mapping[key]) {
        const value = mapping[key] as string;
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
      items.push({
        name: rule.name,
        category: rule.category,
        branch: CHONG_MAP[ctx.yearZhi],
      });
      break;
    }

    case 'year_branch_offset': {
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
      const ganOrder: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const zhiOrder: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      const dayGanIdx = ganOrder.indexOf(ctx.dayGan);
      const dayZhiIdx = zhiOrder.indexOf(ctx.dayZhi);
      const xunStartZhiIdx = (dayZhiIdx - dayGanIdx + 12) % 12;

      const null1 = zhiOrder[(xunStartZhiIdx + 10) % 12];
      const null2 = zhiOrder[(xunStartZhiIdx + 11) % 12];

      items.push({ name: rule.name, category: rule.category, branch: null1 });
      items.push({ name: rule.name, category: rule.category, branch: null2 });
      break;
    }

    case 'derived': {
      // 派生神煞：基于已解析的源神煞，应用合/冲等方法
      const { source, method: deriveMethod } = rule.rules;
      if (!source || !deriveMethod) break;

      const sourceItems = resolved.filter(r => r.name === source);
      for (const src of sourceItems) {
        if (deriveMethod === 'gan_he') {
          // 天干合：取源神煞地支对应的天干，找其合干，再取合干寄宫
          // 反查：找到源地支对应的天干（通过 GAN_JI_GONG 反查）
          const srcBranch = src.branch;
          const srcGan = Object.entries(GAN_JI_GONG).find(([, v]) => v === srcBranch)?.[0] as Gan | undefined;
          if (srcGan) {
            const heGan = GAN_HE[srcGan];
            const heBranch = GAN_JI_GONG[heGan];
            items.push({
              name: rule.name,
              category: rule.category,
              branch: heBranch,
            });
          }
        }
      }
      break;
    }

    default:
      break;
  }

  return items;
}
