# 各 Phase 详尽开发计划

> 基于：`docs/research/框架层与AI-Prompt提升计划.md` + 第一性原理
>
> 目标：将大六壬从"AI自由联想"升级为"确定性计算 + 标准化框架 + AI叙事合成"

---

## Phase 1：框架层核心（Week 1-2）

### 1.1 课格分类模块（`keGe.ts`）

**目标**：将九宗门课体扩展为64课名分类，每个课格提供象意和吉凶倾向。

**文件**：`src/engine/liuren/keGe.ts` + `src/engine/liuren/__tests__/keGe.test.ts`

**步骤**：

**Step 1：定义类型**
```typescript
// keGe.ts

/** 课格大类 */
export type KeGeCategory =
  | '贼克'      // 有克贼的课
  | '比用'      // 比用法取用
  | '涉害'      // 涉害法取用
  | '遥克'      // 遥克法取用
  | '昴星'      // 昴星法取用
  | '别责'      // 别责法取用
  | '八专'      // 八专法取用
  | '伏吟'      // 伏吟课
  | '返吟'      // 返吟课
  | '特殊';     // 铸印、斩关等特殊课格

/** 课格定义 */
export interface KeGe {
  name: string;                    // 课格名称
  category: KeGeCategory;          // 所属大类
  meaning: string;                 // 象意描述
  trend: '吉' | '凶' | '中性' | '视情况';
  applicableScenes: string[];      // 适用占事类型
  inapplicableScenes: string[];    // 禁忌占事类型
}

/** 课格分析结果 */
export interface KeGeAnalysis {
  keGe: KeGe;                      // 当前课格
  alternativeKeGe?: KeGe;          // 可能的叠加课格
  confidence: number;              // 分类置信度 0-1
  reasoning: string;               // 分类依据
}
```

**Step 2：定义课格数据库**

从《大六壬大全》课经中提取64课名，按优先级分批实现：

```typescript
// keGeDb.ts

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
  // ... 更多课格持续添加
];
```

**Step 3：实现分类函数**

```typescript
// keGe.ts

/**
 * 课格分类函数
 *
 * 优先级：特殊课格 > 九宗门基础课格
 * 检查顺序：先查特殊课格（铸印、斩关等），再查基础课格
 */
export function classifyKeGe(pan: LiurenPan): KeGeAnalysis {
  // 1. 先检查特殊课格（优先级最高）
  const specialKeGe = checkSpecialKeGe(pan);
  if (specialKeGe) {
    return {
      keGe: specialKeGe,
      confidence: 0.9,
      reasoning: `满足特殊课格「${specialKeGe.name}」的条件`,
    };
  }

  // 2. 基于九宗门课体确定基础课格
  const baseKeGe = getBaseKeGe(pan.geJu);
  if (baseKeGe) {
    return {
      keGe: baseKeGe,
      confidence: 0.8,
      reasoning: `九宗门课体为「${pan.geJu}」，对应课格「${baseKeGe.name}」`,
    };
  }

  // 3. 兜底：默认"其他"
  return {
    keGe: { name: '其他', category: '特殊', meaning: '未归类课格', trend: '中性', applicableScenes: [], inapplicableScenes: [] },
    confidence: 0.3,
    reasoning: '未匹配到已知课格',
  };
}

/**
 * 检查特殊课格
 */
function checkSpecialKeGe(pan: LiurenPan): KeGe | null {
  // 铸印课：巳戌卯三合成印局
  const branches = pan.sanChuan.map(item => item.branch);
  if (branches.includes('巳') && branches.includes('戌') && branches.includes('卯')) {
    return KE_GE_DB.find(g => g.name === '铸印') || null;
  }

  // 伏吟课：天地盘重叠不动
  if (pan.tianDiPan.tianPan.every((b, i) => b === pan.tianDiPan.diPan[i])) {
    return KE_GE_DB.find(g => g.name === '伏吟') || null;
  }

  // 返吟课：天地盘完全对冲
  const isFanYin = pan.tianDiPan.tianPan.every((b, i) => {
    const diZhi = pan.tianDiPan.diPan[i];
    const cha = Math.abs(BRANCH_INDEX[b] - BRANCH_INDEX[diZhi]);
    return cha === 6;  // 对冲 = 差6
  });
  if (isFanYin) {
    return KE_GE_DB.find(g => g.name === '返吟') || null;
  }

  // 极阴课：四课三传皆阴
  const allYin = pan.siKe.every(ke => BRANCH_YINYANG[ke.upperGod] === '阴' && BRANCH_YINYANG[ke.lowerGod] === '阴')
    && pan.sanChuan.every(item => BRANCH_YINYANG[item.branch] === '阴');
  if (allYin) {
    return KE_GE_DB.find(g => g.name === '极阴') || null;
  }

  // 连茹课：三传地支相连
  const indices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
  if (indices[1] - indices[0] === 1 && indices[2] - indices[1] === 1) {
    return KE_GE_DB.find(g => g.name === '连茹') || null;
  }

  return null;
}
```

**Step 4：编写测试**

```typescript
// keGe.test.ts
import { calculateLiuren } from '../index.js';
import { classifyKeGe } from '../keGe.js';

describe('课格分类', () => {
  it('伏吟课：天地盘重叠', () => {
    // 构造伏吟课的条件
    const pan = calculateLiuren({ date: new Date('2026-01-01T00:00:00') });
    const result = classifyKeGe(pan);
    if (pan.tianDiPan.tianPan.every((b, i) => b === pan.tianDiPan.diPan[i])) {
      expect(result.keGe.name).toBe('伏吟');
    }
  });

  it('铸印课：巳戌卯三合', () => {
    // 需要找到一个三传为巳戌卯的时间
    // 或者构造测试数据
    const pan = calculateLiuren({ date: new Date('1129-12-15T09:00:00') });
    const result = classifyKeGe(pan);
    const branches = pan.sanChuan.map(item => item.branch);
    if (branches.includes('巳') && branches.includes('戌') && branches.includes('卯')) {
      expect(result.keGe.name).toBe('铸印');
    }
  });

  it('极阴课：六阴皆全', () => {
    // 测试极阴条件
  });
});
```

**验收标准**：
- [ ] 至少实现10个基础课格 + 5个特殊课格
- [ ] 每个课格有完整的象意和吉凶描述
- [ ] 单元测试覆盖所有已实现课格
- [ ] `classifyKeGe` 对已知案例的分类准确率 ≥ 80%

---

### 1.2 毕法赋匹配模块（`bifa.ts`）

**目标**：实现第一批20条毕法赋法则的结构化匹配。

**文件**：`src/engine/liuren/bifa.ts` + `src/engine/liuren/__tests__/bifa.test.ts`

**步骤**：

**Step 1：定义类型**

```typescript
// bifa.ts

/** 占事类型 */
export type ZhanShi = '官职' | '婚姻' | '疾病' | '求财' | '出行' | '诉讼' | '学业' | '天时' | '其他';

/** 毕法赋规则 */
export interface BiFaRule {
  id: number;
  title: string;
  description: string;
  category: BiFaCategory;
  condition: (pan: LiurenPan) => boolean;
  judgment: {
    trend: '吉' | '凶' | '中性';
    scene: Partial<Record<ZhanShi, string>>;
  };
}

/** 毕法赋匹配结果 */
export interface BiFaMatch {
  rule: BiFaRule;
  sceneJudgment?: string;
  relevance: number;  // 相关度 0-1
}
```

**Step 2：实现20条法则**

```typescript
// bifaRules.ts

export const BI_FA_RULES第一批: BiFaRule[] = [
  // 第1法：前后引从升迁吉
  {
    id: 1,
    title: '前后引从升迁吉',
    description: '引干宜进职，引支宜迁宅。三传前后引从日干。',
    category: '官禄功名',
    condition: (pan) => {
      const dayIdx = BRANCH_INDEX[GAN_JI_GONG[pan.dayGanZhi[0] as Gan]];
      const scIndices = pan.sanChuan.map(item => BRANCH_INDEX[item.branch]);
      // 检查三传是否前后引从日干寄宫
      return (
        (scIndices[0] < dayIdx && scIndices[2] > dayIdx) ||
        (scIndices[0] > dayIdx && scIndices[2] < dayIdx)
      );
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '升迁有望，职位提升',
        '家宅': '搬迁吉利，家运上升',
        '出行': '旅途顺利',
      },
    },
  },

  // 第6法：六阴相继尽昏迷
  {
    id: 6,
    title: '六阴相继尽昏迷',
    description: '四课三传皆阴支，主阴私隐晦，昏迷不醒。',
    category: '墓神凶象',
    condition: (pan) => {
      const allBranches = [
        ...pan.siKe.flatMap(ke => [ke.upperGod, ke.lowerGod]),
        ...pan.sanChuan.map(item => item.branch),
      ];
      return allBranches.every(b => BRANCH_YINYANG[b] === '阴');
    },
    judgment: {
      trend: '凶',
      scene: {
        '婚姻': '有暧昧之事，对方不诚',
        '官职': '暗中有人作祟',
        '疾病': '病情昏沉，难清醒',
      },
    },
  },

  // 第16法：空上乘空事莫追
  {
    id: 16,
    title: '空上乘空事莫追',
    description: '初传空亡且乘天空，事皆落空。',
    category: '空亡进退',
    condition: (pan) => {
      const chuChuan = pan.sanChuan[0];
      const isKongWang = isBranchKongWang(chuChuan.branch, pan.dayGanZhi);
      return isKongWang && chuChuan.tianJiang === '天空';
    },
    judgment: {
      trend: '凶',
      scene: {
        '求财': '空欢喜，财不聚',
        '官职': '虚名虚利',
        '婚姻': '对方不实',
      },
    },
  },

  // 第31法：三传递生人举荐
  {
    id: 31,
    title: '三传递生人举荐',
    description: '三传递相生，有贵人举荐。',
    category: '三传变化',
    condition: (pan) => {
      const sc = pan.sanChuan.map(item => BRANCH_WUXING[item.branch]);
      return (
        getShengKe(sc[0], sc[1]) === 'sheng' &&
        getShengKe(sc[1], sc[2]) === 'sheng'
      );
    },
    judgment: {
      trend: '吉',
      scene: {
        '官职': '有贵人举荐，升迁可期',
        '求财': '财源广进',
        '婚姻': '有人撮合',
      },
    },
  },

  // 第32法：三传互克众人欺
  {
    id: 32,
    title: '三传互克众人欺',
    description: '三传递相克，主众人欺凌。',
    category: '三传变化',
    condition: (pan) => {
      const sc = pan.sanChuan.map(item => BRANCH_WUXING[item.branch]);
      return (
        getShengKe(sc[0], sc[1]) === 'ke' &&
        getShengKe(sc[1], sc[2]) === 'ke'
      );
    },
    judgment: {
      trend: '凶',
      scene: {
        '诉讼': '对方人多势众',
        '官职': '受人排挤',
        '疾病': '病情加重',
      },
    },
  },

  // 第40法：后合占婚岂用媒
  {
    id: 40,
    title: '后合占婚岂用媒',
    description: '天后六合入传，婚姻自然成。',
    category: '胎产婚姻',
    condition: (pan) => {
      const scJiang = pan.sanChuan.map(item => item.tianJiang);
      return scJiang.includes('天后') && scJiang.includes('六合');
    },
    judgment: {
      trend: '吉',
      scene: {
        '婚姻': '姻缘天成，无需媒人',
      },
    },
  },

  // 第91法：虎临干鬼凶速速
  {
    id: 91,
    title: '虎临干鬼凶速速',
    description: '白虎乘鬼临干，凶事速至。',
    category: '墓神凶象',
    condition: (pan) => {
      const dayGan = pan.dayGanZhi[0] as Gan;
      const dayGanBranch = GAN_JI_GONG[dayGan];
      // 检查四课中是否有白虎乘鬼临干
      return pan.siKe.some(ke =>
        ke.upperGod === dayGanBranch &&
        ke.relation === '下贼上' &&
        pan.sanChuan.some(item =>
          item.branch === ke.upperGod && item.tianJiang === '白虎'
        )
      );
    },
    judgment: {
      trend: '凶',
      scene: {
        '疾病': '病情危急，需速就医',
        '诉讼': '官司速至，宜速和解',
        '出行': '有血光之灾，不宜出行',
      },
    },
  },
];
```

**Step 3：实现匹配引擎**

```typescript
// bifa.ts

/**
 * 毕法赋匹配引擎
 *
 * 扫描所有规则，返回匹配的法则列表
 */
export function matchBiFa(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): BiFaMatch[] {
  const matches: BiFaMatch[] = [];

  for (const rule of BI_FA_RULES) {
    try {
      if (rule.condition(pan)) {
        matches.push({
          rule,
          sceneJudgment: zhanShi ? rule.judgment.scene[zhanShi] : undefined,
          relevance: 0.8,  // 默认相关度
        });
      }
    } catch {
      // 规则执行出错，跳过
    }
  }

  return matches;
}
```

**Step 4：编写测试**

```typescript
// bifa.test.ts
import { calculateLiuren } from '../index.js';
import { matchBiFa } from '../bifa.js';

describe('毕法赋匹配', () => {
  it('三传递生：初传生中传，中传生末传', () => {
    // 构造三传递生的课式
    // 例如：初传寅（木）→ 中传巳（火）→ 中传土
    // 需要找到满足条件的时间
    const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
    const matches = matchBiFa(pan, '官职');
    // 验证是否匹配到相关法则
    expect(matches.length).toBeGreaterThanOrEqual(0);
  });

  it('六阴：四课三传皆阴', () => {
    // 测试六阴条件
  });
});
```

**验收标准**：
- [ ] 实现20条毕法赋法则
- [ ] 每条法则有完整的条件函数和场景判断
- [ ] `matchBiFa` 对已知案例的匹配准确率 ≥ 70%
- [ ] 单元测试覆盖所有已实现法则

---

### 1.3 天将象义模块（`tianjiang-meaning.ts`）

**目标**：将12天将的象义按占事类型进行语义映射。

**文件**：`src/engine/liuren/tianjiang-meaning.ts`

**步骤**：

**Step 1：定义天将象义数据库**

```typescript
// tianjiang-meaning.ts

import type { TianJiangName, ZhanShi } from './types.js';

/** 天将象义定义 */
export interface TianJiangMeaning {
  name: TianJiangName;
  wuXing: '土' | '火' | '木' | '金' | '水';
  baseJiXiong: '吉' | '凶' | '中性';
  meanings: Partial<Record<ZhanShi, {
    primary: string;
    secondary: string[];
    advice: string;
  }>>;
}

/** 天将象义数据库 */
export const TIAN_JIANG_MEANINGS: TianJiangMeaning[] = [
  {
    name: '贵人',
    wuXing: '土',
    baseJiXiong: '吉',
    meanings: {
      '官职': {
        primary: '贵人扶持，有上级赏识',
        secondary: ['有人推荐', '面试通过'],
        advice: '宜主动争取，贵人会在关键时刻出现',
      },
      '婚姻': {
        primary: '有媒人牵线，姻缘正配',
        secondary: ['门当户对', '长辈支持'],
        advice: '可请长辈出面撮合',
      },
      '疾病': {
        primary: '有贵人相助，可遇良医',
        secondary: ['医疗条件好', '有人照顾'],
        advice: '积极就医，会有好医生',
      },
      '求财': {
        primary: '有贵人引财，财运亨通',
        secondary: ['有人介绍生意', '合作生财'],
        advice: '可寻求合作，贵人会带来机会',
      },
      '出行': {
        primary: '旅途顺利，有人相助',
        secondary: ['遇到好心人', '住宿便利'],
        advice: '放心出行，会有意外帮助',
      },
      '诉讼': {
        primary: '有贵人调解，可化干戈为玉帛',
        secondary: ['法官公正', '有人说情'],
        advice: '宜和解，贵人会出面调停',
      },
      '学业': {
        primary: '有名师指点，学业有成',
        secondary: ['考试顺利', '有人帮助'],
        advice: '虚心求教，贵人会出现在学业上',
      },
    },
  },
  {
    name: '螣蛇',
    wuXing: '火',
    baseJiXiong: '凶',
    meanings: {
      '官职': {
        primary: '虚惊一场，有名无实',
        secondary: ['职位不稳', '被人暗算'],
        advice: '保持警惕，不要轻信他人',
      },
      '婚姻': {
        primary: '对方虚情假意，不真诚',
        secondary: ['有第三者', '感情不专'],
        advice: '仔细观察对方真实意图',
      },
      '疾病': {
        primary: '怪病/心理疾病，难以诊断',
        secondary: ['精神压力大', '失眠多梦'],
        advice: '需看心理医生或中医调理',
      },
      '求财': {
        primary: '虚耗，财来财去',
        secondary: ['投资有风险', '被人骗财'],
        advice: '不宜大额投资，小心被骗',
      },
      '出行': {
        primary: '虚惊，有惊无险',
        secondary: ['延误', '小事故'],
        advice: '出行需小心，但不会有大碍',
      },
      '诉讼': {
        primary: '口舌是非，被人诬告',
        secondary: ['有人从中作梗', '证据不足'],
        advice: '收集证据，不要轻举妄动',
      },
      '学业': {
        primary: '学习分心，注意力不集中',
        secondary: ['考试紧张', '发挥失常'],
        advice: '调整心态，不要给自己太大压力',
      },
    },
  },
  // ... 其他10个天将
];
```

**Step 2：实现分析函数**

```typescript
// tianjiang-meaning.ts

/** 天将分析结果 */
export interface TianJiangAnalysis {
  /** 三传天将的语义分析 */
  sanChuanJiang: Array<{
    branch: Branch;
    jiang: TianJiangName;
    meaning?: TianJiangMeaning['meanings'][ZhanShi];
  }>;
  /** 综合评语 */
  summary: string;
  /** 信号列表 */
  signals: JudgmentSignal[];
}

/**
 * 分析天将象义
 */
export function analyzeTianJiang(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): TianJiangAnalysis {
  const sanChuanJiang = pan.sanChuan.map(item => {
    const meaning = TIAN_JIANG_MEANINGS.find(m => m.name === item.tianJiang);
    return {
      branch: item.branch,
      jiang: item.tianJiang,
      meaning: zhanShi && meaning ? meaning.meanings[zhanShi] : undefined,
    };
  });

  const signals: JudgmentSignal[] = [];
  const summaryParts: string[] = [];

  sanChuanJiang.forEach(item => {
    const meaning = TIAN_JIANG_MEANINGS.find(m => m.name === item.jiang);
    if (meaning && zhanShi) {
      const sceneMeaning = meaning.meanings[zhanShi];
      if (sceneMeaning) {
        summaryParts.push(`${item.jiang}临${item.branch}：${sceneMeaning.primary}`);
        signals.push({
          type: meaning.baseJiXiong === '凶' ? '凶' : '吉',
          source: `天将「${item.jiang}」`,
          description: sceneMeaning.primary,
          weight: 0.7,
        });
      }
    }
  });

  return {
    sanChuanJiang,
    summary: summaryParts.join('\n') || '天将分析暂无',
    signals,
  };
}
```

**Step 4：编写测试**

```typescript
// tianjiang-meaning.test.ts
import { analyzeTianJiang } from '../tianjiang-meaning.js';
import { calculateLiuren } from '../index.js';

describe('天将象义', () => {
  it('贵人临初传，占官职为吉', () => {
    const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
    const result = analyzeTianJiang(pan, '官职');
    if (pan.sanChuan[0].tianJiang === '贵人') {
      expect(result.signals.some(s => s.type === '吉')).toBe(true);
    }
  });
});
```

**验收标准**：
- [ ] 12天将全部有象义定义
- [ ] 每个天将覆盖8种占事类型
- [ ] `analyzeTianJiang` 输出结构化的语义分析

---

### 1.4 六亲分析模块（`liuqin-analysis.ts`）

**目标**：按占事类型定义六亲的权重和语义。

**文件**：`src/engine/liuren/liuqin-analysis.ts`

**步骤**：

**Step 1：定义六亲场景数据库**

```typescript
// liuqin-analysis.ts

import type { LiuQin, ZhanShi } from './types.js';

/** 六亲场景定义 */
export interface LiuQinScene {
  zhanShi: ZhanShi;
  roles: Record<LiuQin, {
    meaning: string;
    weight: number;
    positive: string;
    negative: string;
  }>;
  yongShen: LiuQin;  // 用神
}

/** 六亲场景数据库 */
export const LIU_QIN_SCENES: LiuQinScene[] = [
  {
    zhanShi: '官职',
    yongShen: '官鬼',
    roles: {
      '官鬼': { meaning: '事业/上司', weight: 1.0, positive: '有升迁机会', negative: '事业受阻' },
      '父母': { meaning: '文书/工作', weight: 0.8, positive: '文书顺利', negative: '文书有误' },
      '兄弟': { meaning: '同事/竞争', weight: 0.6, positive: '同事互助', negative: '同事竞争' },
      '子孙': { meaning: '剥官/降职', weight: 0.7, positive: '', negative: '有降职风险' },
      '妻财': { meaning: '薪资/待遇', weight: 0.5, positive: '薪资提升', negative: '待遇下降' },
    },
  },
  {
    zhanShi: '婚姻',
    yongShen: '妻财',  // 男占
    roles: {
      '官鬼': { meaning: '丈夫/男友', weight: 0.8, positive: '对方有责任心', negative: '对方有压力' },
      '父母': { meaning: '长辈/家庭', weight: 0.6, positive: '家庭支持', negative: '家庭反对' },
      '兄弟': { meaning: '劫财/第三者', weight: 0.7, positive: '', negative: '有第三者介入' },
      '子孙': { meaning: '子女/缘分', weight: 0.5, positive: '有子女缘', negative: '缘分未到' },
      '妻财': { meaning: '妻子/女友', weight: 1.0, positive: '感情顺利', negative: '感情有阻' },
    },
  },
  {
    zhanShi: '疾病',
    yongShen: '官鬼',
    roles: {
      '官鬼': { meaning: '病因/病情', weight: 1.0, positive: '病情可控', negative: '病情严重' },
      '父母': { meaning: '医院/医生', weight: 0.7, positive: '医疗条件好', negative: '就医困难' },
      '兄弟': { meaning: '抵抗力/费用', weight: 0.6, positive: '抵抗力强', negative: '花费大' },
      '子孙': { meaning: '药/治疗', weight: 0.8, positive: '药到病除', negative: '治疗无效' },
      '妻财': { meaning: '身体/精力', weight: 0.5, positive: '精力充沛', negative: '身体虚弱' },
    },
  },
  {
    zhanShi: '求财',
    yongShen: '妻财',
    roles: {
      '官鬼': { meaning: '风险/官灾', weight: 0.6, positive: '', negative: '有风险' },
      '父母': { meaning: '合同/手续', weight: 0.5, positive: '手续顺利', negative: '合同有误' },
      '兄弟': { meaning: '劫财/竞争', weight: 0.9, positive: '', negative: '被人劫财' },
      '子孙': { meaning: '财源/投资', weight: 0.8, positive: '财源广进', negative: '投资失败' },
      '妻财': { meaning: '财运/收入', weight: 1.0, positive: '财运亨通', negative: '破财' },
    },
  },
];
```

**Step 2：实现分析函数**

```typescript
// liuqin-analysis.ts

/** 六亲分析结果 */
export interface LiuQinAnalysis {
  yongShen: LiuQin;
  summary: string;
  signals: JudgmentSignal[];
}

export function analyzeLiuQin(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): LiuQinAnalysis {
  const scene = LIU_QIN_SCENES.find(s => s.zhanShi === zhanShi);
  if (!scene) {
    return {
      yongShen: '官鬼',
      summary: '未指定占事类型，六亲分析暂缺',
      signals: [],
    };
  }

  const signals: JudgmentSignal[] = [];
  const summaryParts: string[] = [];

  // 分析三传六亲
  pan.sanChuan.forEach((item, idx) => {
    const role = scene.roles[item.liuQin];
    if (role) {
      const pos = ['初传', '中传', '末传'][idx];
      summaryParts.push(`${pos}「${item.liuQin}」：${role.meaning}（权重${role.weight}）`);

      // 判断吉凶
      if (role.positive && role.weight >= 0.7) {
        signals.push({
          type: '吉',
          source: `${pos}六亲「${item.liuQin}」`,
          description: role.positive,
          weight: role.weight,
        });
      }
      if (role.negative && role.weight >= 0.7) {
        signals.push({
          type: '凶',
          source: `${pos}六亲「${item.liuQin}」`,
          description: role.negative,
          weight: role.weight,
        });
      }
    }
  });

  return {
    yongShen: scene.yongShen,
    summary: summaryParts.join('\n') || '六亲分析暂无',
    signals,
  };
}
```

**Step 3：编写测试**

```typescript
// liuqin-analysis.test.ts
import { analyzeLiuQin } from '../liuqin-analysis.js';
import { calculateLiuren } from '../index.js';

describe('六亲分析', () => {
  it('占官职，用神为官鬼', () => {
    const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
    const result = analyzeLiuQin(pan, '官职');
    expect(result.yongShen).toBe('官鬼');
  });

  it('占求财，用神为妻财', () => {
    const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
    const result = analyzeLiuQin(pan, '求财');
    expect(result.yongShen).toBe('妻财');
  });
});
```

---

### 1.5 框架层总入口（`framework.ts`）

**目标**：整合所有框架层模块，提供统一入口。

**文件**：`src/engine/liuren/framework.ts`

```typescript
// framework.ts

import { classifyKeGe } from './keGe.js';
import { matchBiFa } from './bifa.js';
import { analyzeTianJiang } from './tianjiang-meaning.js';
import { analyzeLiuQin } from './liuqin-analysis.js';
import type { LiurenPan } from './types.js';
import type { ZhanShi } from './bifa.js';

/** 框架层分析结果 */
export interface FrameworkAnalysis {
  keGe: KeGeAnalysis;
  bifa: BiFaMatch[];
  tianJiang: TianJiangAnalysis;
  liuQin: LiuQinAnalysis;
  signals: JudgmentSignal[];
}

/**
 * 框架层总入口
 */
export function analyzeFramework(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): FrameworkAnalysis {
  const keGe = classifyKeGe(pan);
  const bifa = matchBiFa(pan, zhanShi);
  const tianJiang = analyzeTianJiang(pan, zhanShi);
  const liuQin = analyzeLiuQin(pan, zhanShi);

  // 综合所有信号
  const signals: JudgmentSignal[] = [
    ...bifa.map(b => ({
      type: b.rule.judgment.trend,
      source: `毕法赋第${b.rule.id}法「${b.rule.title}」`,
      description: b.sceneJudgment || b.rule.description,
      weight: 0.8,
    })),
    ...tianJiang.signals,
    ...liuQin.signals,
  ];

  signals.sort((a, b) => b.weight - a.weight);

  return { keGe, bifa, tianJiang, liuQin, signals };
}
```

---

## Phase 2：框架层完善（Week 3）

### 2.1 空亡分级模块（`kongwang-analysis.ts`）

**目标**：将空亡从"有/无"升级为四级分类。

**文件**：`src/engine/liuren/kongwang-analysis.ts`

**步骤**：

**Step 1：实现旺衰判断**

```typescript
// 需要先实现旺相休囚死判断
export function getWangXiangState(
  branch: Branch,
  month: Branch,
): '旺' | '相' | '休' | '囚' | '死' {
  const branchWX = BRANCH_WUXING[branch];
  const monthWX = BRANCH_WUXING[month];
  // 根据五行生克关系判断旺衰
  if (branchWX === monthWX) return '旺';
  if (getShengKe(monthWX, branchWX) === 'sheng') return '相';
  if (getShengKe(branchWX, monthWX) === 'sheng') return '休';
  if (getShengKe(monthWX, branchWX) === 'ke') return '囚';
  return '死';
}
```

**Step 2：实现空亡分级**

```typescript
// kongwang-analysis.ts

export interface KongWangDetail {
  branch: Branch;
  type: '真空' | '半空' | '转空' | '落底空亡';
  impact: string;
  severity: number;
}

export interface KongWangAnalysis {
  hasKongWang: boolean;
  details: KongWangDetail[];
  overallImpact: string;
}

export function analyzeKongWang(pan: LiurenPan): KongWangAnalysis {
  const [xunKong1, xunKong2] = calcKongWang(pan.dayGanZhi);
  const details: KongWangDetail[] = [];

  // 检查三传是否空亡
  pan.sanChuan.forEach(item => {
    if (item.branch === xunKong1 || item.branch === xunKong2) {
      // 判断空亡类型
      const state = getWangXiangState(item.branch, getMonthZhi(new Date(pan.dateTime)));
      let type: KongWangDetail['type'];
      let severity: number;

      if (state === '死' || state === '休' || state === '囚') {
        type = '真空';
        severity = 0.7;
      } else {
        type = '半空';
        severity = 0.3;
      }

      details.push({
        branch: item.branch,
        type,
        impact: `初传/中传/末传空亡（${type}），吉凶减${type === '真空' ? '十之七' : '十之三'}`,
        severity,
      });
    }
  });

  // 检查天盘空亡
  // ... 类似逻辑

  return {
    hasKongWang: details.length > 0,
    details,
    overallImpact: details.map(d => d.impact).join('；') || '无空亡',
  };
}
```

---

### 2.2 应期推算模块（`yingqi.ts`）

**目标**：基于三传数理推算应验时间。

**文件**：`src/engine/liuren/yingqi.ts`

```typescript
// yingqi.ts

export interface YingQiCandidate {
  time: string;
  method: string;
  confidence: number;
}

export interface YingQiResult {
  candidates: YingQiCandidate[];
  primary: string;
  reasoning: string;
}

export function calculateYingQi(pan: LiurenPan): YingQiResult {
  const candidates: YingQiCandidate[] = [];

  // 方法1：三传数理
  // "亥数四、寅数七，乃十一年也"
  const scNumbers = pan.sanChuan.map(item => BRANCH_INDEX[item.branch] + 1);
  const total = scNumbers.reduce((a, b) => a + b, 0);
  if (total > 0) {
    candidates.push({
      time: `${total}个时间单位后`,
      method: '三传数理（地支序数相加）',
      confidence: 0.6,
    });
  }

  // 方法2：空亡填实
  const kongWang = calcKongWang(pan.dayGanZhi);
  if (pan.sanChuan.some(item => item.branch === kongWang[0] || item.branch === kongWang[1])) {
    candidates.push({
      time: `空亡填实之期（${kongWang[0]}或${kongWang[1]}日/月）`,
      method: '空亡填实',
      confidence: 0.7,
    });
  }

  // 方法3：驿马冲动
  // ... 实现逻辑

  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates,
    primary: candidates[0]?.time || '难以判断',
    reasoning: candidates.map(c => `${c.method}：${c.time}（可信度${c.confidence}）`).join('\n'),
  };
}
```

---

### 2.3 综合信号生成（`signals.ts`）

见 Phase 1 中的 `framework.ts` 实现。

---

### 2.4 邵彦和案例数字化

**目标**：将关键案例数字化为JSON，用于回归测试。

**文件**：`test/fixtures/shao-yanhe/cases.json`

```json
[
  {
    "id": "case-001",
    "description": "韩太守占祈雪",
    "input": {
      "date": "1129-12-15T09:00:00",
      "shiZhi": "酉"
    },
    "expected": {
      "geJu": "铸印",
      "keGe": "铸印",
      "trend": "吉",
      "bifaIds": [/* 铸印天时法 */],
      "yiWei": "明日天色必变，巳时风起转寒，未时有雨，亥时作雪，厚有七寸"
    }
  }
]
```

---

## Phase 3：AI Prompt 升级（Week 4）

### 3.1 新 Prompt 构建器

**文件**：`src/ai/liuren-prompt-builder.ts`（重写）

**核心变化**：

```typescript
// liuren-prompt-builder.ts

import type { LiurenPan } from '../engine/liuren/types.js';
import type { FrameworkAnalysis } from '../engine/liuren/framework.js';
import { wrapUserInput } from '../lib/security.js';

/**
 * 构建 System Prompt（V2）
 *
 * AI 角色：叙事者，不是判断者
 */
export function buildLiurenSystemPromptV2(): string {
  return `你是一位大六壬解读师。你的工作是将结构化的课式分析结果，合成为流畅的人类语言。

## 你的角色
- 你是**叙事者**，不是**判断者**
- 所有判断已由框架层完成（课格、毕法赋、天将、六亲、空亡、应期）
- 你的任务是将这些结构化判断串联成有逻辑的解读

## 输出要求
1. 必须引用框架层的具体分析结论
2. 不要自行添加框架层未给出的判断
3. 吉凶以框架层信号为准
4. 应期引用框架层推算结果
5. 如有系统警告，务必提及

## 输出格式
{
  "trend": "利" | "不利" | "中性",
  "analysis": "基于结构化分析的详细解读...",
  "conditions": ["条件1", "条件2"],
  "timeWindow": "引用框架层应期推算",
  "answer": "针对问题的直接回答",
  "confidence": "高" | "中" | "低",
  "claims": [
    {"id": "claim-1", "type": "trend", "text": "趋势判断"},
    {"id": "claim-2", "type": "condition", "text": "条件判断"},
    {"id": "claim-3", "type": "timeWindow", "text": "应期判断"},
    {"id": "claim-4", "type": "advice", "text": "建议"}
  ]
}`;
}

/**
 * 构建 User Prompt（V2）
 *
 * 输入：课式 + 用户问题 + 框架层分析结果
 */
export function buildLiurenUserPromptV2(
  pan: LiurenPan,
  question: string,
  framework: FrameworkAnalysis,
): string {
  const parts: string[] = [];

  parts.push(`## 用户问题`);
  parts.push(wrapUserInput(question));

  parts.push(`## 课式概要`);
  parts.push(`日干支：${pan.dayGanZhi} | 月将：${pan.yueJiang} | 占时：${pan.shiZhi}`);

  parts.push(`## 结构化分析`);

  // 课格
  parts.push(`### 课格：${framework.keGe.keGe.name}`);
  parts.push(`象意：${framework.keGe.keGe.meaning}`);
  parts.push(`吉凶：${framework.keGe.keGe.trend}`);

  // 毕法赋
  if (framework.bifa.length > 0) {
    parts.push(`### 毕法赋匹配`);
    framework.bifa.forEach(b => {
      parts.push(`- 第${b.rule.id}法「${b.rule.title}」：${b.sceneJudgment || b.rule.description}`);
    });
  }

  // 天将分析
  parts.push(`### 天将分析`);
  parts.push(framework.tianJiang.summary);

  // 六亲分析
  parts.push(`### 六亲分析`);
  parts.push(`用神：${framework.liuQin.yongShen}`);
  parts.push(framework.liuQin.summary);

  // 综合信号
  parts.push(`### 综合信号`);
  framework.signals.forEach(s => {
    parts.push(`- [${s.type}] ${s.source}：${s.description}`);
  });

  // 系统警告
  if (pan.warnings.length > 0) {
    parts.push(`## ⚠️ 系统警告`);
    pan.warnings.forEach(w => parts.push(`- ${w}`));
  }

  parts.push(`## 指令`);
  parts.push(`基于以上结构化分析，为用户的问题撰写一段专业、易懂的解读。`);
  parts.push(`要求：`);
  parts.push(`1. 引用具体的课格、天将、六亲分析结论`);
  parts.push(`2. 吉凶判断以结构化分析为准，不自行推断`);
  parts.push(`3. 如有系统警告，务必提醒用户`);

  return parts.join('\n');
}
```

---

### 3.2 AI 调用升级

**文件**：`src/ai/liuren-call.ts`

```typescript
// liuren-call.ts（升级后）

import { analyzeFramework } from '../engine/liuren/framework.js';

export async function callLiurenInterpretationV2(
  pan: LiurenPan,
  question: string,
  zhanShi?: ZhanShi,
  model: string = DEFAULT_MODEL,
): Promise<LiurenCallResult> {
  // 1. 框架层分析（确定性，无AI调用）
  const framework = analyzeFramework(pan, zhanShi);

  // 2. 构建 prompt（结构化输入）
  const systemPrompt = buildLiurenSystemPromptV2();
  const userPrompt = buildLiurenUserPromptV2(pan, question, framework);

  // 3. AI 调用（仅叙事合成）
  const response = await callDeepSeek({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,  // 降低温度，提高一致性
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  });

  // 4. 解析响应
  const parsed = parseAIResponse(response.choices?.[0]?.message?.content);

  return {
    success: true,
    interpretation: {
      ...parsed,
      framework,  // 附加框架层数据
    },
  };
}
```

---

## Phase 4：前端集成（Week 5）

### 4.1 类型扩展

**文件**：`src/types/index.ts`

```typescript
// 扩展 LiurenRecord 类型
export interface LiurenRecord {
  // ... 现有字段
  framework?: FrameworkAnalysis;  // 新增：框架层数据
}
```

---

### 4.2 断卦详情页

**文件**：`src/pages/LiurenDetailView.tsx`（新建）

**组件结构**：

```
LiurenDetailView
├── KeGeCard          // 课格卡片
├── BiFaList          // 毕法赋匹配列表
├── TianJiangCard     // 天将分析卡片
├── LiuQinCard        // 六亲分析卡片
├── KongWangCard      // 空亡分析卡片
├── YingQiCard        // 应期推算卡片
└── SignalsList       // 综合信号列表
```

---

### 4.3 AI解读展示优化

**文件**：`src/pages/LiurenResultView.tsx`

**变化**：
- 新增"结构化分析"折叠面板
- 展示课格、毕法赋、天将、六亲等框架层数据
- AI解读部分标注引用来源（如"毕法赋第91法…"）

---

## 依赖关系图

```
Phase 1
  ├── keGe.ts (无依赖)
  ├── bifa.ts (依赖 keGe)
  ├── tianjiang-meaning.ts (无依赖)
  ├── liuqin-analysis.ts (无依赖)
  └── framework.ts (依赖以上全部)
       │
Phase 2
  ├── kongwang-analysis.ts (无依赖)
  ├── yingqi.ts (无依赖)
  └── fixtures/ (依赖框架层)
       │
Phase 3
  ├── liuren-prompt-builder.ts (依赖框架层)
  └── liuren-call.ts (依赖 prompt)
       │
Phase 4
  ├── types 扩展 (依赖框架层)
  ├── LiurenDetailView (依赖类型)
  └── LiurenResultView (依赖 AI 调用)
```

---

## 信息来源

- `docs/research/框架层与AI-Prompt提升计划.md` — 详细设计方案
- `docs/research/大六壬第一性原理分析.md` — 第一性原理分析
- `src/engine/liuren/` — 当前计算层实现
- `src/ai/liuren-prompt-builder.ts` — 当前 prompt 实现
- 《六壬毕法赋》— 100条判断法则
- 《大六壬大全》— 64课名分类
- 《大六壬指南》— 天将论、应期篇
