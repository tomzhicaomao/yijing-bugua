// ========== 大六壬核心类型定义 ==========

/** 十二地支 */
export type Branch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 十天干 */
export type Gan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 十二天将名称 */
export type TianJiangName = '贵人' | '螣蛇' | '朱雀' | '六合' | '勾陈' | '青龙' | '天空' | '白虎' | '太常' | '玄武' | '太阴' | '天后';

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 六亲 */
export type LiuQin = '父母' | '兄弟' | '妻财' | '官鬼' | '子孙';

/** 四课上下关系 */
export type KeRelation = '上克下' | '下贼上' | '比和';

/** 九宗门课体格局 */
export type GeJu = '元首' | '重审' | '知一' | '涉害' | '遥克' | '昴星' | '别责' | '八专' | '伏吟' | '返吟';

/** 神煞吉凶分类 */
export type ShenShaCategory = '吉' | '凶' | '中性';

/** 三传单项 */
export interface SanChuanItem {
  branch: Branch;
  tianJiang: TianJiangName;
  liuQin: LiuQin;
  dunGan: Gan;
}

/** 四课单项 */
export interface SiKeItem {
  upperGod: Branch;      // 上神
  lowerGod: Branch;      // 下神
  relation: KeRelation;  // 生克关系
}

/** 天盘地支映射（十二地支顺序索引） */
export interface TianDiPan {
  diPan: Branch[];                        // 固定地盘 [子丑寅...亥]
  tianPan: Branch[];                      // 天盘（偏移后）
  diToTian: Record<Branch, Branch>;       // 地→天映射（地盘地支→天盘地支）
}

/** 天将信息 */
export interface TianJiangInfo {
  guiRenBranch: Branch;                   // 贵人所在支
  direction: '顺' | '逆';                  // 顺逆
  branchToJiang: Record<Branch, TianJiangName>;  // 各支所乘天将
}

/** 神煞单项 */
export interface ShenShaItem {
  category: ShenShaCategory;
  name: string;
  branch: Branch;
}

/** 完整课式 */
export interface LiurenPan {
  // 起课信息
  dateTime: string;                        // ISO datetime
  solarTerm: string;                       // 节气名称
  yueJiang: Branch;                        // 月将
  shiZhi: Branch;                          // 占时
  dayGanZhi: string;                       // 日干支，如 "己未"
  isDaytime: boolean;                      // 昼夜

  // 格局
  geJu: GeJu;                              // 课体格局

  // 地盘天盘
  tianDiPan: TianDiPan;

  // 四课
  siKe: [SiKeItem, SiKeItem, SiKeItem, SiKeItem];  // 一课、二课、三课、四课

  // 三传
  sanChuan: [SanChuanItem, SanChuanItem, SanChuanItem];  // 初传、中传、末传

  // 天将
  tianJiang: TianJiangInfo;

  // 遁干六亲
  dunGan: {
    shiGan: Gan;                           // 时干
    sanChuanGan: [Gan, Gan, Gan];          // 三传天干
  };

  // 神煞
  shenSha: ShenShaItem[];

  // 防误判标记
  warnings: string[];                      // 矛盾标记、节气边界警告等
}

/** 起课参数 */
export interface LiurenParams {
  date: Date;
  shiZhi?: Branch;                         // 可选，不传则使用占时推算
  question?: string;
}

/** 九宗门计算结果（用于内部级联） */
export interface SanChuanResult {
  chuChuan: Branch;
  zhongChuan: Branch;
  moChuan: Branch;
  geJu: GeJu;
  details?: string;
}

/** 防误判检查结果 */
export interface WarningResult {
  warnings: string[];
}

/** 日干寄宫映射 */
export const GAN_JI_GONG: Record<Gan, Branch> = {
  '甲': '寅', '乙': '辰',
  '丙': '巳', '丁': '未',
  '戊': '巳', '己': '未',
  '庚': '申', '辛': '戌',
  '壬': '亥', '癸': '丑',
};

/** 地支阴阳 */
export const BRANCH_YINYANG: Record<Branch, '阳' | '阴'> = {
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴',
  '辰': '阳', '巳': '阴', '午': '阳', '未': '阴',
  '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴',
};

/** 地支五行 */
export const BRANCH_WUXING: Record<Branch, WuXing> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
};

/** 天干五行 */
export const GAN_WUXING: Record<Gan, WuXing> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/** 贵人查表 [昼贵人, 夜贵人] 按日干索引 */
export const GUI_REN_TABLE: Record<Gan, [Branch, Branch]> = {
  '甲': ['丑', '未'], '乙': ['子', '申'],
  '丙': ['亥', '酉'], '丁': ['酉', '亥'],
  '戊': ['丑', '未'], '己': ['子', '申'],
  '庚': ['丑', '未'], '辛': ['午', '寅'],
  '壬': ['卯', '巳'], '癸': ['巳', '卯'],
};

/** 天将顺逆序列 */
export const TIAN_JIANG_SHUN: TianJiangName[] = [
  '贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后',
];

/** 天将逆序列 */
export const TIAN_JIANG_NI: TianJiangName[] = [
  '贵人', '天后', '太阴', '玄武', '太常', '白虎', '天空', '青龙', '勾陈', '六合', '朱雀', '螣蛇',
];

/** 五行生克 */
export function getShengKe(a: WuXing, b: WuXing): 'sheng' | 'ke' | 'bihe' {
  const shengCycle: Record<WuXing, WuXing> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const keCycle: Record<WuXing, WuXing> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  if (a === b) return 'bihe';
  if (shengCycle[a] === b) return 'sheng';
  if (keCycle[a] === b) return 'ke';
  return 'bihe';
}

/** 所有地支（顺序索引 0-11，子=0） */
export const ALL_BRANCHES: Branch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 地支索引映射 */
export const BRANCH_INDEX: Record<Branch, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
};

/** 所有天干 */
export const ALL_GANS: Gan[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 天干索引映射 */
export const GAN_INDEX: Record<Gan, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4, '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9,
};
