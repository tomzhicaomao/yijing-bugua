/**
 * 大六壬引擎主入口
 *
 * 完整起课流程：
 *   1. 推算日干支、节气、月将
 *   2. 构建天地盘
 *   3. 生成四课
 *   4. 计算三传（九宗门级联）
 *   5. 排布天将
 *   6. 计算遁干六亲
 *   7. 收集神煞
 *   8. 防误判检查
 */

import type { Branch, Gan, LiurenPan, LiurenParams } from './types.js';
import { GAN_JI_GONG } from './types.js';
import { buildTianDiPan } from './tiandi-pan.js';
import { getCurrentZhongQi, getYueJiang, getSolarTerm, isNearSolarTermBoundary } from './jieqi.js';
import { buildSiKe } from './sike.js';
import { calculateSanChuan } from './sanchuan.js';
import { layoutTianJiang } from './tianjiang.js';
import { calcShiGan, buildSanChuanItems } from './dungan.js';
import { collectShenSha } from './shensha.js';
import { checkTaiSui } from './tai-sui-check.js';
import { detectShenShaConflict } from './shensha-conflict.js';
import { detectKongWang } from './kongwang-detect.js';
import { checkJieqiBoundary } from './jieqi-boundary.js';

// 天干地支序列
const GAN_ORDER: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_ORDER: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 排列日干支
 *
 * 简化版：基于已知日期推算日干支
 * 使用甲子日为起点（1900年1月31日为甲子日）
 *
 * @param date 日期
 * @returns [日干, 日支]
 */
export function calcDayGanZhi(date: Date): [Gan, Branch] {
  // 1900年1月31日 = 甲子日
  const baseDate = new Date(1900, 0, 31);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const ganIdx = ((diffDays % 10) + 10) % 10;
  const zhiIdx = ((diffDays % 12) + 12) % 12;
  return [GAN_ORDER[ganIdx], ZHI_ORDER[zhiIdx]];
}

/**
 * 排列年干支
 *
 * @param year 年份
 * @returns [年干, 年支]
 */
export function calcYearGanZhi(year: number): [Gan, Branch] {
  // 甲子年 = 1984年
  const diff = year - 1984;
  const ganIdx = ((diff % 10) + 10) % 10;
  const zhiIdx = ((diff % 12) + 12) % 12;
  return [GAN_ORDER[ganIdx], ZHI_ORDER[zhiIdx]];
}

/**
 * 排列时干支
 *
 * @param date 日期+时间
 * @param dayGan 日干
 * @returns [时干, 时支]
 */
export function calcShiGanZhi(date: Date, dayGan: Gan): [Gan, Branch] {
  // 时支：每2小时一个时辰
  const hour = date.getHours();
  const zhiIdx = Math.floor(((hour + 1) % 24) / 2);
  const shiZhi = ZHI_ORDER[zhiIdx];
  const shiGan = calcShiGan(dayGan, shiZhi);
  return [shiGan, shiZhi];
}

/**
 * 完整起课
 *
 * @param params 起课参数
 * @returns 完整课式
 */
export function calculateLiuren(params: LiurenParams): LiurenPan {
  const { date, shiZhi: customShiZhi, question } = params;

  // 1. 推算日干支
  const [dayGan, dayZhi] = calcDayGanZhi(date);
  const dayGanZhi = `${dayGan}${dayZhi}`;

  // 2. 推算年干支
  const year = date.getFullYear();
  const [yearGan, yearZhi] = calcYearGanZhi(year);

  // 3. 推算时干支
  const [shiGan, shiZhi] = customShiZhi
    ? [calcShiGan(dayGan, customShiZhi), customShiZhi]
    : calcShiGanZhi(date, dayGan);

  // 4. 获取节气和月将
  const zhongQi = getCurrentZhongQi(date);
  const yueJiang = getYueJiang(date);
  const solarTerm = getSolarTerm(date);
  const isNearBoundary = isNearSolarTermBoundary(date);

  // 5. 判断昼夜
  const hour = date.getHours();
  const isDaytime = hour >= 6 && hour < 18;

  // 6. 构建天地盘
  const tianDiPan = buildTianDiPan(yueJiang, shiZhi);

  // 7. 生成四课
  const siKe = buildSiKe(dayGan, dayZhi, tianDiPan);

  // 8. 计算三传
  const sanChuanResult = calculateSanChuan(siKe, dayGan, dayZhi, tianDiPan);

  // 9. 排布天将
  const tianJiangInfo = layoutTianJiang(dayGan, shiZhi, tianDiPan);

  // 10. 计算遁干六亲
  const sanChuanItems = buildSanChuanItems(sanChuanResult, dayGan, dayZhi, tianJiangInfo);

  // 11. 收集神煞
  const shiZhiBranch = shiZhi;
  const monthZhi = yueJiang; // 月支近似为月将
  const shenSha = collectShenSha(yearGan, yearZhi, monthZhi, dayGan, dayZhi, shiZhiBranch);

  // 12. 防误判检查
  const warnings: string[] = [];

  // 太岁校验
  const taiSui = checkTaiSui(
    { siKe, sanChuan: sanChuanItems, shenSha } as LiurenPan,
    yearZhi,
  );
  warnings.push(...taiSui.warnings);

  // 神煞矛盾
  const conflict = detectShenShaConflict(shenSha);
  if (conflict.hasConflict) {
    conflict.conflicts.forEach(c => {
      warnings.push(`⚠️ 神煞矛盾：${c.message}`);
    });
  }

  // 空亡检测
  const kongWang = detectKongWang(siKe, sanChuanItems, dayGan, dayZhi);
  warnings.push(...kongWang.warnings);

  // 节气边界
  if (isNearBoundary) {
    warnings.push(`⚠️ 占时接近节气边界，月将可能不准`);
  }

  // 13. 构建完整课式
  const pan: LiurenPan = {
    dateTime: date.toISOString(),
    solarTerm,
    yueJiang,
    shiZhi,
    dayGanZhi,
    isDaytime,
    geJu: sanChuanResult.geJu,
    tianDiPan,
    siKe,
    sanChuan: sanChuanItems,
    tianJiang: tianJiangInfo,
    dunGan: {
      shiGan,
      sanChuanGan: sanChuanItems.map(item => item.dunGan) as [Gan, Gan, Gan],
    },
    shenSha,
    warnings,
  };

  return pan;
}

// 导出所有子模块
export { buildTianDiPan, getTianPanZhi } from './tiandi-pan.js';
export { buildSiKe, analyzeSiKe, getKeRelation } from './sike.js';
export { calculateSanChuan } from './sanchuan.js';
export { layoutTianJiang, isDaytime } from './tianjiang.js';
export { calcShiGan, calcDunGan, calcLiuQin, buildSanChuanItems } from './dungan.js';
export { collectShenSha } from './shensha.js';
export { checkTaiSui } from './tai-sui-check.js';
export { detectShenShaConflict } from './shensha-conflict.js';
export { checkJieqiBoundary } from './jieqi-boundary.js';
export { detectKongWang, calcKongWang } from './kongwang-detect.js';
export { runAllWarnings } from './warnings.js';
