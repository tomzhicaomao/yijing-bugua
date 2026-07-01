# 框架层与 AI Prompt 提升计划

> 目标：将大六壬从"AI自由联想"模式升级为"确定性计算 + 标准化框架 + AI叙事合成"三层架构
>
> 关联文档：`docs/research/大六壬第一性原理分析.md`

---

## 〇、现状诊断

### 当前 AI Prompt 的问题

读完 `src/ai/liuren-prompt-builder.ts`，核心问题一目了然：

**prompt 把原始数据扔给 AI，让它从零开始判断。**

具体表现：

1. **课体只传了名称**：`格局：${pan.geJu}` — 只告诉AI是"元首"还是"涉害"，没告诉它这个格局意味着什么
2. **天将只传了排布**：`贵人在${pan.tianJiang.guiRenBranch}` — 没有传天将的象义（贵人=百神之主，螣蛇=怪异忧惊）
3. **六亲只传了标签**：`六亲：${item.liuQin}` — 没有传六亲在当前占事下的权重
4. **毕法赋完全缺失**：100条判断法则一条都没用上
5. **空亡只传了检测结果**：没有传空亡的分类（真空/半空/转空）
6. **应期完全靠AI猜**：prompt里写"应期判断：根据初传旺衰…"，但没有给AI任何应期计算的结构化数据

**结果**：AI在做它不擅长的事——从原始数据中提炼判断规则。而它擅长的事（将结构化判断合成为流畅语言）反而没机会发挥。

### 类比

这就像给一个医生一摞原始化验单（血常规、CT、心电图），但不告诉他每项指标的正常范围和临床意义，然后让他直接写诊断报告。医生当然能写——但准确率和效率都会大打折扣。

正确做法是：先让检验科出一份结构化的"异常指标报告"，医生基于这份报告写诊断。

---

## 一、总体架构升级

### 从"AI全包"到"三层分工"

```
当前架构（AI全包）：
  计算层 → [原始数据] → AI → 断语
                    ↑
              AI做所有判断

目标架构（三层分工）：
  计算层 → 框架层 → [结构化判断] → AI → 断语
              ↑                        ↑
        确定性规则              只做叙事合成
```

### 框架层的六个模块

| 模块 | 输入 | 输出 | 文件 |
|------|------|------|------|
| 课格分类 | LiurenPan | 课格对象（含象意、吉凶倾向） | `keGe.ts` |
| 毕法赋匹配 | LiurenPan | 匹配的法则列表（含相关度） | `bifa.ts` |
| 天将象义 | LiurenPan + 占事类型 | 天将语义分析 | `tianjiang-meaning.ts` |
| 六亲分析 | LiurenPan + 占事类型 | 六亲权重 + 关系分析 | `liuqin-analysis.ts` |
| 空亡分析 | LiurenPan | 空亡分类 + 影响评估 | `kongwang-analysis.ts` |
| 应期推算 | LiurenPan | 应期候选列表 | `yingqi.ts` |

### 框架层的输出结构

```typescript
interface FrameworkAnalysis {
  // 课格
  keGe: KeGeAnalysis;
  // 毕法赋
  bifa: BiFaMatch[];
  // 天将
  tianJiang: TianJiangAnalysis;
  // 六亲
  liuQin: LiuQinAnalysis;
  // 空亡
  kongWang: KongWangAnalysis;
  // 应期
  yingQi: YingQiResult;
  // 综合信号
  signals: JudgmentSignal[];
}
```

---

## 二、模块详细设计

### 模块1：课格分类（`keGe.ts`）

**职责**：将九宗门课体扩展为完整的64课名分类，并提供每个课格的象意。

**数据来源**：《大六壬大全》课经、《毕法赋》课格部分

**实现方案**：

```typescript
// 课格定义
interface KeGe {
  name: string;           // "铸印"、"斩关"、"励德"等
  category: KeGeCategory; // 所属大类
  meaning: string;        // 象意描述
  trend: '吉' | '凶' | '中性' | '视情况';
  适用场景: string[];      // 适合的占事类型
  禁忌场景: string[];     // 不适合的占事类型
}

// 判断逻辑
function classifyKeGe(pan: LiurenPan): KeGe {
  // 基于四课结构、三传关系、天地盘状态进行分类
  // 优先级：特殊课格 > 一般课格
}
```

**64课名分类表**（核心 subset）：

| 课格 | 判断条件 | 象意 | 吉凶 |
|------|----------|------|------|
| 铸印 | 巳戌卯三合成印局 | 文书/印信/权力 | 吉（占官职） |
| 乘轩 | 三传合局生干 | 仕途顺利 | 吉 |
| 斩关 | 初传为干之鬼，被中传所克 | 突破障碍 | 中性 |
| 励德 | 阴阳不备，课体不全 | 需要振作 | 中性 |
| 三奇 | 亥子丑/申酉戌等三奇汇聚 | 特别吉凶 | 视组合 |
| 极阴 | 六阴皆全 | 阴私隐晦 | 凶（占阳事） |
| 伏吟 | 天地盘重叠不动 | 迟滞/伏匿 | 凶（占行动） |
| 返吟 | 天地盘完全对冲 | 反复/变动 | 视情况 |
| 连茹 | 三传地支相连 | 事情连续发展 | 视方向 |
| 锢 | 三传入墓 | 困顿/受阻 | 凶 |

**实现优先级**：🔴 高 — 这是框架层的基础

### 模块2：毕法赋匹配（`bifa.ts`）

**职责**：将《毕法赋》100法编码为结构化规则，自动匹配当前课式。

**数据来源**：《六壬毕法赋》全文 + 《六壬大全》注释

**实现方案**：

```typescript
// 毕法赋规则定义
interface BiFaRule {
  id: number;                    // 1-100
  title: string;                 // "前后引从升迁吉"
  description: string;           // 补充说明
  category: BiFaCategory;        // 所属类别
  condition: (pan: LiurenPan) => boolean;  // 匹配函数
  judgment: {
    trend: '吉' | '凶' | '中性';
    scene: Partial<Record<ZhanShi, string>>;  // 不同占事的判断
  };
}

// 匹配引擎
function matchBiFa(pan: LiurenPan, zhanShi?: ZhanShi): BiFaMatch[] {
  return BI_FA_RULES
    .filter(rule => rule.condition(pan))
    .map(rule => ({
      rule,
      sceneJudgment: zhanShi ? rule.judgment.scene[zhanShi] : undefined,
    }));
}
```

**100法分类编码**（按优先级分批实现）：

**第一批（20法，覆盖最高频课格）**：

| 序号 | 法则 | 匹配逻辑 | 优先级 |
|------|------|----------|--------|
| 1 | 前后引从升迁吉 | 三传前后引从日干 | 🔴 |
| 6 | 六阴相继尽昏迷 | 四课三传皆阴 | 🔴 |
| 11 | 众鬼虽彰全不畏 | 四课多鬼但有制 | 🔴 |
| 14 | 传财太旺反财亏 | 三传皆财且旺 | 🔴 |
| 16 | 空上乘空事莫追 | 初传空亡且乘天空 | 🔴 |
| 17 | 进茹空亡宜退步 | 三传连茹且初传空 | 🔴 |
| 25 | 金日逢丁凶祸动 | 金日干+丁神入传 | 🔴 |
| 26 | 水日逢丁财动之 | 水日干+丁神入传 | 🔴 |
| 31 | 三传递生人举荐 | 三传递相生 | 🔴 |
| 32 | 三传互克众人欺 | 三传递相克 | 🔴 |
| 39 | 太阳照武宜擒贼 | 玄武乘太阳 | 🔴 |
| 40 | 后合占婚岂用媒 | 天后六合入传 | 🔴 |
| 46 | 贵人差迭事参差 | 贵人昼夜错位 | 🔴 |
| 51 | 魁度天门关隔定 | 戌临亥（天门） | 🔴 |
| 53 | 两蛇夹墓凶难免 | 螣蛇夹墓神 | 🔴 |
| 60 | 太阳射宅屋光辉 | 月将乘青龙临支 | 🔴 |
| 67 | 受虎克神为病症 | 白虎所乘之神克日 | 🔴 |
| 83 | 万事喜忻三六合 | 三传合局 | 🟡 |
| 91 | 虎临干鬼凶速速 | 白虎乘鬼临干 | 🔴 |
| 94 | 喜惧空亡乃妙机 | 空亡在关键位置 | 🔴 |

**第二批（30法）**：第2-5、7-10、12-13、15、18-24、27-30、33-38、41-45、47-50法

**第三批（50法）**：剩余全部

**实现策略**：不追求一次性编码全部100法。先实现第一批20法，用邵彦和案例验证，再逐步扩展。

### 模块3：天将象义（`tianjiang-meaning.ts`）

**职责**：将12天将的象义按占事类型进行语义映射。

**数据来源**：《指掌赋》天将篇、《大六壬指南》天将论

**实现方案**：

```typescript
// 天将象义定义
interface TianJiangMeaning {
  name: TianJiangName;
  wuXing: WuXing;
  baseJiXiong: '吉' | '凶' | '中性';
  // 不同占事下的具体象义
  meanings: Partial<Record<ZhanShi, {
    primary: string;      // 主要象义
    secondary: string[];  // 次要象义
    advice: string;       // 相关建议
  }>>;
}

// 语义分析
function analyzeTianJiang(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): TianJiangAnalysis {
  // 分析每个天将在四课三传中的位置和含义
  // 特别关注：天将乘神的五行生克关系
}
```

**12天将象义映射表**：

| 天将 | 占官职 | 占婚姻 | 占疾病 | 占求财 | 占诉讼 |
|------|--------|--------|--------|--------|--------|
| 贵人 | 贵人扶持 | 有媒人 | 有贵人相助 | 有贵人引财 | 有贵人调解 |
| 螣蛇 | 虚惊一场 | 对方虚情 | 怪病/心理病 | 虚耗 | 口舌是非 |
| 朱雀 | 文书/口舌 | 争吵 | 炎症/热病 | 口舌求财 | 诉讼文书 |
| 六合 | 合作 | 婚姻和合 | 病情反复 | 合作求财 | 和解 |
| 勾陈 | 拖延 | 纠缠 | 慢性病 | 迟滞 | 争斗 |
| 青龙 | 升迁/喜庆 | 喜事 | 病情好转 | 财运亨通 | 胜诉 |
| 天空 | 虚名 | 对方不实 | 虚病 | 空欢喜 | 虚诈 |
| 白虎 | 官灾/调动 | 丧事 | 重病/血光 | 破财 | 刑讼 |
| 太常 | 俸禄/擢升 | 稳定 | 病情稳定 | 稳定收入 | 平淡 |
| 玄武 | 暗中竞争 | 奸情 | 暗病 | 失盗 | 暗中诉讼 |
| 太阴 | 暗中贵人 | 暗恋/私情 | 隐疾 | 暗财 | 暗中操作 |
| 天后 | 女性贵人 | 女方/妻子 | 妇科病 | 女性助财 | 女性相关 |

**实现优先级**：🔴 高 — 这是AI叙事层的关键输入

### 模块4：六亲分析（`liuqin-analysis.ts`）

**职责**：按占事类型定义六亲的权重和语义。

**数据来源**：《大六壬指南》六亲论、《毕法赋》相关法则

**实现方案**：

```typescript
// 占事类型
type ZhanShi = '官职' | '婚姻' | '疾病' | '求财' | '出行' | '诉讼' | '学业' | '其他';

// 六亲场景定义
interface LiuQinScene {
  zhanShi: ZhanShi;
  // 每个六亲在该占事下的含义
  roles: Record<LiuQin, {
    meaning: string;     // "官鬼=事业压力"、"妻财=薪资收入"
    weight: number;      // 权重 0-1，1=核心
    positive: string;    // 吉时含义
    negative: string;    // 凶时含义
  }>;
  // 用神确定规则
  yongShenRule: string;
}

// 分析函数
function analyzeLiuQin(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): LiuQinAnalysis {
  // 确定用神
  // 分析三传六亲的生克关系
  // 输出结构化判断
}
```

**六亲场景速查表**：

| 占事 | 用神 | 核心六亲 | 辅助六亲 | 忌神 |
|------|------|----------|----------|------|
| 占官职 | 官鬼 | 官鬼（事业）| 父母（文书）| 子孙（剥官）|
| 占婚姻（男）| 妻财 | 妻财（妻子）| 天后（女性）| 兄弟（劫财）|
| 占婚姻（女）| 官鬼 | 官鬼（丈夫）| 青龙（喜庆）| 子孙（克夫）|
| 占疾病 | 官鬼 | 官鬼（病因）| 天医（方位）| 子孙（制鬼）|
| 占求财 | 妻财 | 妻财（财运）| 青龙（财帛）| 兄弟（劫财）|
| 占出行 | 驿马 | 驿马（行动）| 日辰关系 | 墓神（受困）|
| 占诉讼 | 官鬼 | 官鬼（官司）| 朱雀（口舌）| 兄弟（耗费）|
| 占学业 | 父母 | 父母（文书）| 贵人（考试）| 官鬼（压力）|

**实现优先级**：🔴 高

### 模块5：空亡分析（`kongwang-analysis.ts`）

**职责**：将空亡从简单的"有/无"升级为分类判断。

**数据来源**：《大六壬探原》论断篇、《毕法赋》空亡相关法则

**实现方案**：

```typescript
interface KongWangAnalysis {
  // 基本空亡信息
  xunKong: [Branch, Branch];     // 旬空
  luoKong: [Branch, Branch];     // 落空

  // 分类判断
  details: Array<{
    branch: Branch;
    type: '真空' | '半空' | '转空' | '落底空亡';
    impact: string;               // 影响描述
    severity: number;             // 影响程度 0-1
  }>;

  // 整体评估
  overallImpact: string;
  advice: string;
}
```

**空亡分类规则**：

| 类型 | 判断条件 | 影响程度 | 示例 |
|------|----------|----------|------|
| 真空 | 空亡支处于死/休/囚状态 | 吉凶减十之七 | 初传空+休囚 → 事难成 |
| 半空 | 空亡支处于旺/相状态 | 吉凶减十之三 | 初传空+旺相 → 事可成但打折 |
| 转空 | 天盘空亡 | 吉凶尚有七八分 | 天盘空 → 填实后应验 |
| 落底空亡 | 地盘空亡 | 吉凶十分 | 地盘空 → 事彻底落空 |

**特殊规则**：
- 太岁、月建、月将、年命虽值空亡，不以空论（填实之义）
- 六合陷空 → 感情不稳定
- 驿马空亡 → 虽有动象而实不行

**实现优先级**：🟡 中

### 模块6：应期推算（`yingqi.ts`）

**职责**：基于三传数理和课式结构，推算事件应验时间。

**数据来源**：《大六壬指南》应期篇、《毕法赋》应期相关法则

**实现方案**：

```typescript
interface YingQiResult {
  candidates: Array<{
    time: string;           // 应期描述（如"亥月"、"十一年后"）
    method: string;         // 推算方法
    confidence: number;     // 可信度 0-1
  }>;
  primary: string;          // 主要应期
  reasoning: string;        // 推算逻辑
}

function calculateYingQi(pan: LiurenPan): YingQiResult {
  const candidates: YingQiResult['candidates'] = [];

  // 方法1：三传数理
  // "亥数四、寅数七，乃十一年也"
  const sanChuanNumber = calcSanChuanNumber(pan);
  if (sanChuanNumber) candidates.push(sanChuanNumber);

  // 方法2：空亡填实
  const kongWangYingQi = calcKongWangYingQi(pan);
  if (kongWangYingQi) candidates.push(kongWangYingQi);

  // 方法3：驿马冲动
  const maYingQi = calcMaYingQi(pan);
  if (maYingQi) candidates.push(maYingQi);

  // 方法4：旺相休囚周期
  const wXingYingQi = calcWXingYingQi(pan);
  if (wXingYingQi) candidates.push(wXingYingQi);

  // 综合排序
  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    candidates,
    primary: candidates[0]?.time || '难以判断',
    reasoning: generateYingQiReasoning(candidates),
  };
}
```

**应期推算方法**：

| 方法 | 规则 | 适用场景 | 可信度 |
|------|------|----------|--------|
| 三传数理 | 地支序数相加 | 三传明确时 | 高 |
| 空亡填实 | 空亡支被填实之期 | 初传空亡时 | 高 |
| 驿马冲动 | 驿马被冲之期 | 占出行/变动 | 中 |
| 旺相周期 | 用神旺相之期 | 通用 | 中 |
| 刑冲合害 | 三传刑冲合害之期 | 特殊课格 | 低 |

**实现优先级**：🟡 中

---

## 三、AI Prompt 升级方案

### 3.1 新 Prompt 架构

**核心变化**：从"给AI原始数据让它判断"变为"给AI结构化判断让它叙事"。

```typescript
// 新的 Prompt 构建函数
function buildLiurenUserPromptV2(
  pan: LiurenPan,
  question: string,
  framework: FrameworkAnalysis,  // 新增：框架层分析结果
): string {
  const parts: string[] = [];

  // 用户问题
  parts.push(`## 用户问题`);
  parts.push(wrapUserInput(question));

  // 课式基本信息（精简）
  parts.push(`## 课式概要`);
  parts.push(`日干支：${pan.dayGanZhi} | 月将：${pan.yueJiang} | 占时：${pan.shiZhi}`);

  // 框架层分析结果（核心新增）
  parts.push(`## 结构化分析`);

  // 课格
  parts.push(`### 课格：${framework.keGe.name}`);
  parts.push(`象意：${framework.keGe.meaning}`);
  parts.push(`吉凶：${framework.keGe.trend}`);

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

  // 空亡
  parts.push(`### 空亡`);
  parts.push(framework.kongWang.overallImpact);

  // 应期
  parts.push(`### 应期推算`);
  parts.push(`主要应期：${framework.yingQi.primary}`);
  parts.push(`推算逻辑：${framework.yingQi.reasoning}`);

  // 综合信号
  parts.push(`### 综合信号`);
  framework.signals.forEach(s => {
    parts.push(`- [${s.type}] ${s.description}`);
  });

  // 系统警告
  if (pan.warnings.length > 0) {
    parts.push(`## ⚠️ 系统警告`);
    pan.warnings.forEach(w => parts.push(`- ${w}`));
  }

  // 指令
  parts.push(`## 指令`);
  parts.push(`基于以上结构化分析，为用户的问题撰写一段专业、易懂的解读。`);
  parts.push(`要求：`);
  parts.push(`1. 引用具体的课格、天将、六亲分析结论`);
  parts.push(`2. 吉凶判断以结构化分析为准，不自行推断`);
  parts.push(`3. 应期引用框架层的推算结果`);
  parts.push(`4. 如有系统警告，务必提醒用户`);

  return parts.join('\n');
}
```

### 3.2 System Prompt 升级

```typescript
function buildLiurenSystemPromptV2(topic?: string): string {
  return `你是一位大六壬解读师。你的工作是将结构化的课式分析结果，合成为流畅的人类语言。

## 你的角色
- 你是**叙事者**，不是**判断者**
- 所有判断已由框架层完成（课格、毕法赋、天将、六亲、空亡、应期）
- 你的任务是将这些结构化判断串联成有逻辑的解读

## 输出要求
1. 必须引用框架层的具体分析结论（如"毕法赋第91法「虎临干鬼凶速速」…"）
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
  "claims": [...]
}`;
}
```

### 3.3 新旧 Prompt 对比

| 维度 | 旧 Prompt | 新 Prompt |
|------|-----------|-----------|
| AI的角色 | 判断者 + 叙事者 | 仅叙事者 |
| 输入数据 | 原始课式 | 结构化判断 |
| 判断依据 | AI自行推断 | 框架层预计算 |
| 可解释性 | 低（黑箱） | 高（每条判断有出处） |
| 一致性 | 低（同一课式可能不同解读） | 高（框架层保证判断一致） |
| 准确性 | 取决于AI对六壬的理解 | 取决于框架层规则的完备性 |

---

## 四、接口设计

### 4.1 框架层总入口

```typescript
// src/engine/liuren/framework.ts

import { classifyKeGe } from './keGe.js';
import { matchBiFa } from './bifa.js';
import { analyzeTianJiang } from './tianjiang-meaning.js';
import { analyzeLiuQin } from './liuqin-analysis.js';
import { analyzeKongWang } from './kongwang-analysis.js';
import { calculateYingQi } from './yingqi.js';
import { generateSignals } from './signals.js';

/**
 * 框架层总入口
 *
 * 将计算层的 LiurenPan 转换为结构化的判断要素
 */
export function analyzeFramework(
  pan: LiurenPan,
  zhanShi?: ZhanShi,
): FrameworkAnalysis {
  const keGe = classifyKeGe(pan);
  const bifa = matchBiFa(pan, zhanShi);
  const tianJiang = analyzeTianJiang(pan, zhanShi);
  const liuQin = analyzeLiuQin(pan, zhanShi);
  const kongWang = analyzeKongWang(pan);
  const yingQi = calculateYingQi(pan);
  const signals = generateSignals(keGe, bifa, tianJiang, liuQin, kongWang);

  return {
    keGe,
    bifa,
    tianJiang,
    liuQin,
    kongWang,
    yingQi,
    signals,
  };
}
```

### 4.2 综合信号生成

```typescript
// src/engine/liuren/signals.ts

interface JudgmentSignal {
  type: '吉' | '凶' | '中性';
  source: string;        // 信号来源（如"毕法赋第91法"）
  description: string;   // 信号描述
  weight: number;        // 权重 0-1
}

/**
 * 综合所有框架层分析，生成判断信号
 */
export function generateSignals(
  keGe: KeGeAnalysis,
  bifa: BiFaMatch[],
  tianJiang: TianJiangAnalysis,
  liuQin: LiuQinAnalysis,
  kongWang: KongWangAnalysis,
): JudgmentSignal[] {
  const signals: JudgmentSignal[] = [];

  // 课格信号
  if (keGe.trend === '吉') {
    signals.push({
      type: '吉',
      source: `课格「${keGe.name}」`,
      description: keGe.meaning,
      weight: 0.6,
    });
  } else if (keGe.trend === '凶') {
    signals.push({
      type: '凶',
      source: `课格「${keGe.name}」`,
      description: keGe.meaning,
      weight: 0.6,
    });
  }

  // 毕法赋信号
  bifa.forEach(b => {
    signals.push({
      type: b.rule.judgment.trend,
      source: `毕法赋第${b.rule.id}法「${b.rule.title}」`,
      description: b.sceneJudgment || b.rule.description,
      weight: 0.8,
    });
  });

  // 天将信号
  tianJiang.signals.forEach(s => signals.push(s));

  // 六亲信号
  liuQin.signals.forEach(s => signals.push(s));

  // 空亡信号
  if (kongWang.hasKongWang) {
    signals.push({
      type: '凶',
      source: '空亡',
      description: kongWang.overallImpact,
      weight: 0.5,
    });
  }

  // 按权重排序
  signals.sort((a, b) => b.weight - a.weight);

  return signals;
}
```

### 4.3 调用流程

```typescript
// src/ai/liuren-call.ts（升级后）

export async function callLiurenInterpretationV2(
  pan: LiurenPan,
  question: string,
  zhanShi?: ZhanShi,
  model: string = DEFAULT_MODEL,
): Promise<LiurenCallResult> {
  // 1. 框架层分析（确定性，无AI调用）
  const framework = analyzeFramework(pan, zhanShi);

  // 2. 构建 prompt（结构化输入）
  const systemPrompt = buildLiurenSystemPromptV2(zhanShi);
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
      // 附加框架层数据，供前端展示
      framework,  // 新增
    },
  };
}
```

---

## 五、测试策略

### 5.1 框架层测试

**每个模块独立测试**，不依赖AI：

```typescript
// keGe.test.ts
describe('课格分类', () => {
  it('己卯日寅将酉时 → 铸印课', () => {
    const pan = calculateLiuren({
      date: new Date('1129-12-15T09:00:00'),  // 建炎三年十一月初四己卯日
    });
    const keGe = classifyKeGe(pan);
    expect(keGe.name).toBe('铸印');
  });
});

// bifa.test.ts
describe('毕法赋匹配', () => {
  it('韩太守占祈雪 → 匹配铸印课天时法则', () => {
    const pan = calculateLiuren({ date: /* 韩太守案例时间 */ });
    const matches = matchBiFa(pan, '天时');
    expect(matches.some(m => m.rule.id === /* 铸印天时法 */)).toBe(true);
  });
});
```

### 5.2 邵彦和案例回归测试

将邵彦和216个案例中的关键案例数字化，作为端到端测试：

```typescript
// shao-yanhe-cases.test.ts
describe('邵彦和案例验证', () => {
  const testCases = loadShaoYanheCases();  // 从JSON加载

  testCases.forEach(({ input, expected }) => {
    it(`邵彦和案例：${expected.description}`, () => {
      // 1. 计算层验证
      const pan = calculateLiuren(input);
      expect(pan.geJu).toBe(expected.geJu);

      // 2. 框架层验证
      const framework = analyzeFramework(pan);
      expect(framework.keGe.name).toBe(expected.keGe);

      // 3. 信号验证
      expect(framework.signals.some(s =>
        s.type === expected.trend
      )).toBe(true);
    });
  });
});
```

### 5.3 AI Prompt 一致性测试

同一课式多次调用，验证输出一致性：

```typescript
describe('AI Prompt 一致性', () => {
  it('同一课式3次调用，趋势判断一致', async () => {
    const pan = calculateLiuren({ date: new Date('2026-06-30T10:00:00') });
    const framework = analyzeFramework(pan);

    const results = await Promise.all([
      callLiurenInterpretationV2(pan, '测试问题'),
      callLiurenInterpretationV2(pan, '测试问题'),
      callLiurenInterpretationV2(pan, '测试问题'),
    ]);

    const trends = results.map(r => r.interpretation?.trend);
    expect(new Set(trends).size).toBe(1);  // 三次结果趋势相同
  });
});
```

---

## 六、实施排期

### Phase 1：框架层核心（Week 1-2）

| 任务 | 文件 | 工时 | 依赖 |
|------|------|------|------|
| 课格分类模块 | `keGe.ts` + 测试 | 3天 | 无 |
| 毕法赋20法 | `bifa.ts` + 测试 | 4天 | keGe |
| 天将象义映射 | `tianjiang-meaning.ts` + 测试 | 2天 | 无 |
| 六亲场景化 | `liuqin-analysis.ts` + 测试 | 2天 | 无 |
| 框架层总入口 | `framework.ts` + 测试 | 1天 | 以上全部 |

### Phase 2：框架层完善（Week 3）

| 任务 | 文件 | 工时 | 依赖 |
|------|------|------|------|
| 空亡分级 | `kongwang-analysis.ts` | 2天 | 无 |
| 应期推算 | `yingqi.ts` | 2天 | 无 |
| 综合信号生成 | `signals.ts` | 1天 | 以上全部 |
| 邵彦和案例数字化 | `test/fixtures/shao-yanhe/` | 2天 | 框架层 |

### Phase 3：AI Prompt 升级（Week 4）

| 任务 | 文件 | 工时 | 依赖 |
|------|------|------|------|
| 新 Prompt 构建器 | `liuren-prompt-builder.ts`（重写）| 2天 | 框架层 |
| 新 System Prompt | `liuren-prompt-builder.ts` | 1天 | 无 |
| AI 调用升级 | `liuren-call.ts` | 1天 | Prompt |
| 一致性测试 | 测试文件 | 1天 | 以上全部 |

### Phase 4：前端集成（Week 5）

| 任务 | 文件 | 工时 | 依赖 |
|------|------|------|------|
| 框架层数据透传 | `LiurenPan` 类型扩展 | 1天 | 框架层 |
| 断卦详情页 | `LiurenDetailView.tsx` | 3天 | 类型 |
| AI解读展示优化 | `LiurenResultView.tsx` | 1天 | AI调用 |

**总工时**：约 25 个工作日（5 周）

---

## 七、验收标准

### 框架层验收

- [ ] 64课名分类覆盖所有已知课格
- [ ] 毕法赋20法匹配准确率 ≥ 90%（邵彦和案例验证）
- [ ] 天将象义覆盖8种主要占事类型
- [ ] 六亲分析覆盖8种主要占事类型
- [ ] 空亡分类4种类型全部实现
- [ ] 应期推算至少支持3种推算方法
- [ ] 所有模块独立单元测试通过

### AI Prompt 验收

- [ ] 同一课式3次调用，趋势判断100%一致
- [ ] AI输出中引用框架层分析结论的比例 ≥ 80%
- [ ] AI输出中不包含框架层未给出的判断
- [ ] 邵彦和关键案例的AI解读与原断语方向一致

### 端到端验收

- [ ] 从时间输入到AI解读输出，全流程 < 10秒
- [ ] 断卦详情页正确展示课格、毕法赋、天将、六亲、空亡、应期
- [ ] 用户输入占事类型后，框架层自动切换场景化分析

---

## 信息来源

- `src/ai/liuren-prompt-builder.ts` — 当前 prompt 实现
- `src/ai/liuren-call.ts` — 当前 AI 调用实现
- `src/engine/liuren/` — 当前计算层实现
- `docs/research/大六壬第一性原理分析.md` — 第一性原理分析
- `docs/research/大六壬_横纵分析报告.md` — 横纵分析法研究报告
- 《六壬毕法赋》— 100条判断法则
- 《大六壬指南》— 课经、天将论、应期篇
- 《大六壬大全》— 64课名分类
