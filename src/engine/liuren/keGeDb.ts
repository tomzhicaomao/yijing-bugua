/**
 * 课格数据库
 *
 * 从《大六壬大全》课经中提取的课名分类，
 * 按九宗门基础课格 + 特殊课格组织。
 */

import type { KeGeCategory } from './framework-types.js';

/** 课格定义 */
export interface KeGe {
  name: string;
  category: KeGeCategory;
  meaning: string;
  trend: '吉' | '凶' | '中性' | '视情况';
  applicableScenes: string[];
  inapplicableScenes: string[];
}

/** 课格数据库 */
export const KE_GE_DB: KeGe[] = [
  // === 第一批：基于九宗门的10个基础课格 ===
  {
    name: '元首',
    category: '贼克',
    meaning: '上克下，主事有序，上行下效。事有尊卑之分，上级主导。',
    trend: '吉',
    applicableScenes: ['官职', '学业'],
    inapplicableScenes: [],
  },
  {
    name: '重审',
    category: '贼克',
    meaning: '下克上，主以下犯上，需审慎。有逆反、反抗之象。',
    trend: '凶',
    applicableScenes: ['诉讼'],
    inapplicableScenes: ['官职'],
  },
  {
    name: '知一',
    category: '贼克',
    meaning: '四课仅一组上下相克，取该克为用。事情单一明确。',
    trend: '中性',
    applicableScenes: ['出行', '其他'],
    inapplicableScenes: [],
  },
  {
    name: '涉害',
    category: '涉害',
    meaning: '多重矛盾，事情复杂纠结。需深思熟虑。',
    trend: '中性',
    applicableScenes: ['诉讼', '其他'],
    inapplicableScenes: ['婚姻'],
  },
  {
    name: '遥克',
    category: '遥克',
    meaning: '事情遥远，主远事。有远方消息、长期等待之象。',
    trend: '中性',
    applicableScenes: ['出行', '行人'],
    inapplicableScenes: [],
  },
  {
    name: '昴星',
    category: '昴星',
    meaning: '无克无遥，主外事。事情不在自己掌控之中。',
    trend: '中性',
    applicableScenes: ['其他'],
    inapplicableScenes: [],
  },
  {
    name: '别责',
    category: '别责',
    meaning: '四课不全，芜淫之象。有暧昧、不正之象。',
    trend: '凶',
    applicableScenes: ['诉讼'],
    inapplicableScenes: ['婚姻', '官职'],
  },
  {
    name: '八专',
    category: '八专',
    meaning: '干支同位，主事遇双。有重复、重叠之象。',
    trend: '中性',
    applicableScenes: ['其他'],
    inapplicableScenes: [],
  },
  {
    name: '伏吟',
    category: '伏吟',
    meaning: '天地不动，主迟滞、伏匿。事情难以推进，宜守不宜动。',
    trend: '凶',
    applicableScenes: [],
    inapplicableScenes: ['出行', '官职'],
  },
  {
    name: '返吟',
    category: '返吟',
    meaning: '天地对冲，主反复、变动。事情来来去去，不稳定。',
    trend: '视情况',
    applicableScenes: ['出行'],
    inapplicableScenes: ['婚姻'],
  },

  // === 第二批：特殊课格（铸印、斩关等） ===
  {
    name: '铸印',
    category: '特殊',
    meaning: '巳戌卯三合成印局。主文书、印信、权力、官方事务。占天时必大雨雪。',
    trend: '吉',
    applicableScenes: ['官职', '学业', '天时'],
    inapplicableScenes: [],
  },
  {
    name: '乘轩',
    category: '特殊',
    meaning: '三传合局生干。主仕途顺利，有贵人提拔之象。',
    trend: '吉',
    applicableScenes: ['官职'],
    inapplicableScenes: [],
  },
  {
    name: '斩关',
    category: '特殊',
    meaning: '初传为干之鬼，被中传所克。主突破障碍，先难后易。',
    trend: '中性',
    applicableScenes: ['官职', '诉讼'],
    inapplicableScenes: [],
  },
  {
    name: '励德',
    category: '特殊',
    meaning: '阴阳不备，课体不全。需要振作精神，自我激励。',
    trend: '中性',
    applicableScenes: ['学业'],
    inapplicableScenes: [],
  },
  {
    name: '三奇',
    category: '特殊',
    meaning: '亥子丑/申酉戌等三奇汇聚。主特别吉凶，视具体组合。',
    trend: '视情况',
    applicableScenes: ['官职', '学业'],
    inapplicableScenes: [],
  },
  {
    name: '极阴',
    category: '特殊',
    meaning: '六阴皆全。主阴私隐晦之事，占阳事不利。',
    trend: '凶',
    applicableScenes: [],
    inapplicableScenes: ['官职', '出行'],
  },
  {
    name: '连茹',
    category: '特殊',
    meaning: '三传地支相连。主事情连续发展，连绵不断。',
    trend: '视情况',
    applicableScenes: ['出行'],
    inapplicableScenes: [],
  },
  {
    name: '铸印乘轩',
    category: '特殊',
    meaning: '铸印+乘轩双课格叠加。大吉之象，主权贵显达。',
    trend: '吉',
    applicableScenes: ['官职', '学业'],
    inapplicableScenes: [],
  },
];
