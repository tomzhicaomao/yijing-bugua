/**
 * 大六壬序列化/反序列化模块
 *
 * 引擎类型 LiurenPan ↔ 持久化类型 LiurenPanData 的双向转换。
 * deserializePan 包含运行时验证，防止脏数据进入引擎。
 */

import type {
  Branch,
  Gan,
  LiurenPan,
  SiKeItem,
  SanChuanItem,
  TianDiPan,
  TianJiangInfo,
  ShenShaItem,
  KeRelation,
  TianJiangName,
} from './types.js';
import type { LiurenPanData } from '../../types/index.js';
import { ALL_BRANCHES, ALL_GANS } from './types.js';
import { calcShiGan } from './dungan.js';

const VALID_BRANCHES_SET = new Set<string>(ALL_BRANCHES);
const VALID_GAN_SET = new Set<string>(ALL_GANS);
const VALID_KE_RELATION = new Set<string>(['上克下', '下贼上', '比和']);

function assertBranch(value: string, label: string): Branch {
  if (!VALID_BRANCHES_SET.has(value)) {
    throw new Error(`deserializePan: 无效的${label} "${value}"`);
  }
  return value as Branch;
}

function assertGan(value: string, label: string): Gan {
  if (!VALID_GAN_SET.has(value)) {
    throw new Error(`deserializePan: 无效的${label} "${value}"`);
  }
  return value as Gan;
}

function assertKeRelation(value: string): KeRelation {
  if (!VALID_KE_RELATION.has(value)) {
    throw new Error(`deserializePan: 无效的课关系 "${value}"`);
  }
  return value as KeRelation;
}

/**
 * 引擎类型 → 持久化类型
 */
export function serializePan(pan: LiurenPan): LiurenPanData {
  return {
    dateTime: pan.dateTime,
    solarTerm: pan.solarTerm,
    yueJiang: pan.yueJiang,
    shiZhi: pan.shiZhi,
    dayGanZhi: pan.dayGanZhi,
    isDaytime: pan.isDaytime,
    geJu: pan.geJu,
    tianDiPan: {
      diPan: pan.tianDiPan.diPan,
      tianPan: pan.tianDiPan.tianPan,
      diToTian: pan.tianDiPan.diToTian,
    },
    siKe: pan.siKe.map((sk: SiKeItem) => ({
      upperGod: sk.upperGod,
      lowerGod: sk.lowerGod,
      relation: sk.relation,
    })),
    sanChuan: pan.sanChuan.map((sc: SanChuanItem) => ({
      branch: sc.branch,
      tianJiang: sc.tianJiang,
      liuQin: sc.liuQin,
      dunGan: sc.dunGan,
    })),
    tianJiang: {
      guiRenBranch: pan.tianJiang.guiRenBranch,
      direction: pan.tianJiang.direction,
      branchToJiang: pan.tianJiang.branchToJiang,
    },
    shenSha: pan.shenSha,
    warnings: pan.warnings,
    nianMing: pan.nianMing,
  };
}

/**
 * 持久化类型 → 引擎类型（带运行时验证）
 */
export function deserializePan(data: LiurenPanData): LiurenPan {
  // 基础字段验证
  if (!data.dayGanZhi || data.dayGanZhi.length < 2) {
    throw new Error('deserializePan: dayGanZhi 格式无效');
  }
  const dayGan = assertGan(data.dayGanZhi[0], '日干');
  assertBranch(data.dayGanZhi[1], '日支'); // 验证日支格式
  const shiZhi = assertBranch(data.shiZhi, '时支');
  const yueJiang = assertBranch(data.yueJiang, '月将');

  // 四课验证
  if (!data.siKe || data.siKe.length !== 4) {
    throw new Error('deserializePan: siKe 必须包含 4 课');
  }
  const siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem] = data.siKe.map((sk: { upperGod: string; lowerGod: string; relation: string }, i: number) => ({
    upperGod: assertBranch(sk.upperGod, `第${i + 1}课上神`),
    lowerGod: assertBranch(sk.lowerGod, `第${i + 1}课下神`),
    relation: assertKeRelation(sk.relation),
  })) as [SiKeItem, SiKeItem, SiKeItem, SiKeItem];

  // 三传验证
  if (!data.sanChuan || data.sanChuan.length !== 3) {
    throw new Error('deserializePan: sanChuan 必须包含 3 传');
  }
  const labels = ['初传', '中传', '末传'] as const;
  const sanChuan: [SanChuanItem, SanChuanItem, SanChuanItem] = data.sanChuan.map((sc: { branch: string; tianJiang: string; liuQin: string; dunGan: string }, i: number) => ({
    branch: assertBranch(sc.branch, `${labels[i]}地支`),
    tianJiang: sc.tianJiang as TianJiangName,
    liuQin: sc.liuQin as LiurenPan['sanChuan'][0]['liuQin'],
    dunGan: assertGan(sc.dunGan, `${labels[i]}遁干`),
  })) as [SanChuanItem, SanChuanItem, SanChuanItem];

  // 天地盘验证
  if (!data.tianDiPan) {
    throw new Error('deserializePan: tianDiPan 缺失');
  }
  const tianDiPan: TianDiPan = {
    diPan: data.tianDiPan.diPan.map((b: string, i: number) => assertBranch(b, `地盘第${i + 1}支`)),
    tianPan: data.tianDiPan.tianPan.map((b: string, i: number) => assertBranch(b, `天盘第${i + 1}支`)),
    diToTian: Object.fromEntries(
      Object.entries(data.tianDiPan.diToTian).map(([k, v]) => [assertBranch(k, '地盘映射键'), assertBranch(v, '地盘映射值')]),
    ) as Record<Branch, Branch>,
  };

  // 天将验证
  if (!data.tianJiang) {
    throw new Error('deserializePan: tianJiang 缺失');
  }
  const tianJiang: TianJiangInfo = {
    guiRenBranch: assertBranch(data.tianJiang.guiRenBranch, '贵人支'),
    direction: data.tianJiang.direction,
    branchToJiang: Object.fromEntries(
      Object.entries(data.tianJiang.branchToJiang).map(([k, v]) => [assertBranch(k, '天将映射键'), v as TianJiangName]),
    ) as Record<Branch, TianJiangName>,
  };

  // 神煞验证
  const shenSha: ShenShaItem[] = (data.shenSha || []).map((ss: { category: string; name: string; branch: string }) => ({
    category: ss.category as ShenShaItem['category'],
    name: ss.name,
    branch: assertBranch(ss.branch, '神煞地支'),
  }));

  return {
    dateTime: data.dateTime,
    solarTerm: data.solarTerm,
    yueJiang,
    shiZhi,
    dayGanZhi: data.dayGanZhi,
    isDaytime: data.isDaytime,
    geJu: data.geJu as LiurenPan['geJu'],
    tianDiPan,
    siKe,
    sanChuan,
    tianJiang,
    dunGan: {
      shiGan: calcShiGan(dayGan, shiZhi),
      sanChuanGan: sanChuan.map((sc: SanChuanItem) => sc.dunGan) as [Gan, Gan, Gan],
    },
    shenSha,
    warnings: data.warnings || [],
  };
}
