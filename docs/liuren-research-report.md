# 大六壬系统调研报告 + 差距分析

> 调研日期：2025-07-01  
> 调研范围：算法准确性、AI 解读质量、缺失功能与数据  
> 参考实现：kentang2017/kinliuren (Python, 99⭐)

---

## 一、现有系统状态

| 层 | 文件 | 状态 |
|---|---|---|
| **类型定义** | `src/engine/liuren/types.ts` | ✅ 完整（200行） |
| **天地盘** | `src/engine/liuren/tiandi-pan.ts` | ⚠️ **offset 公式方向错误** |
| **四课** | `src/engine/liuren/sike.ts` | ⚠️ 基于错误天地盘 |
| **三传（九宗门）** | `src/engine/liuren/sanchuan.ts` + `jiuzongmen/` (9个文件) | ⚠️ 别责/八专三传推导缺失 |
| **天将** | `src/engine/liuren/tianjiang.ts` | ⚠️ 基于错误天地盘 |
| **遁干六亲** | `src/engine/liuren/dungan.ts` | 待验证 |
| **神煞** | `src/engine/liuren/shensha.ts` + `data/liuren/shensha-rules.json` | ✅ 比 kinliuren 更全面 |
| **防误判** | `tai-sui-check.ts` / `shensha-conflict.ts` / `kongwang-detect.ts` | ✅ 有 |
| **AI Prompt** | `src/ai/liuren-prompt-builder.ts` | ⚠️ 基础框架，缺少高级断课知识 |
| **UI** | `src/components/liuren/` (8个组件) | ✅ 基本完整 |
| **测试** | `tests/engine/liuren/` (4个文件, 87个测试) | ⚠️ 基于错误天地盘的自洽测试 |

---

## 二、发现的关键问题

### 🔴 P0 — 天地盘 offset 公式方向错误

**文件**: `src/engine/liuren/tiandi-pan.ts:27`

```typescript
// 当前（错误）:
const offset = ((shiZhiIdx - yueJiangIdx) % 12 + 12) % 12;

// 正确:
const offset = ((yueJiangIdx - shiZhiIdx) % 12 + 12) % 12;
```

**影响**: 天地盘是整个大六壬系统的基础。offset 方向反了导致：
- 所有 diToTian 映射错误（每个位置偏移了错误的方向）
- 四课推导基于错误的天地盘
- 三传计算基于错误的四课
- 天将排布基于错误的天地盘
- **整个系统输出与 kinliuren 完全不一致**

**验证**:
```
kinliuren: diToTian[子]=戌, diToTian[丑]=亥, diToTian[寅]=子
我们:      diToTian[子]=寅, diToTian[丑]=卯, diToTian[寅]=辰
```

**修复**: 一行代码修改。但修复后所有现有测试的 expected 值都需要更新。

### 🟠 P1 — 别责/八专三传推导缺失

**文件**: `src/engine/liuren/jiuzongmen/bieze.ts`, `bazhuan.ts`

两个模块的中传和末传直接重复初传：
```typescript
return { chuChuan, zhongChuan: chuChuan, moChuan: chuChuan };
```

但 kinliuren 的正确行为是：
- 别责: 初=寅 → 中=午(初传在天盘所临) → 末=午
- 八专: 初=巳 → 中=亥(初传在天盘所临) → 末=亥

**修复**: 调用已有的 `deriveZhongMoChuan(chuChuan, tianDiPan)` 函数。

### 🟡 P2 — 现有测试基于错误天地盘

所有 87 个测试都是在错误天地盘上自洽的。修复 P0 后，以下测试的 expected 值需要更新：
- `liuren-all.test.ts` 中的手工构造案例
- `sike.test.ts` 中的四课测试
- `kinliuren-crossref.test.ts` 中的手工验证
- `tianjiang-crossref.test.ts` 中的天盘验证

---

## 三、AI 解读质量差距

### 当前实现
- `liuren-prompt-builder.ts`: 基础"六步断课法"框架
- `liuren-fallback.ts`: 离线降级解读（非常简单）
- 固定 prompt，不区分问事类型

### 参考实现（命语 aov.cc）
- **问事类型模板**: general/ganqing/shiye/caifu 四种
- **结构化 prompt**: 将排盘数据 + 断课规则 + 用户问题组合为完整提示词
- **三传叙事线**: 以初传→中传→末传的流转作为解读主线
- **公开 API**: `/divination/liuren/prompt` 一站式返回排盘+提示词

### 建议改进
1. 添加问事类型模板（事业/感情/财运/健康）
2. 在 prompt 中补充天将×地支吉凶矩阵（kinliuren 有完整的 12×12 表）
3. 添加应期推算规则（当前 fallback 只有"伏吟=迟缓"）
4. 补充课体详解数据（每个格局的深层含义和解读要点）

---

## 四、神煞覆盖度

- kinliuren: 通过零散方法（dayhorse/moonhorse/dinhorse/wahgai/lightning 等）提供约 10 种神煞
- 我们: `shensha-rules.json` 包含 30+ 条规则，覆盖天乙贵人、驿马、天德、月德、空亡等
- **我们的实现比 kinliuren 更全面**，无需补全

---

## 五、后续修复计划建议

### Phase 1: 修复核心算法（最高优先级）
1. 修复 `tiandi-pan.ts` 的 offset 公式
2. 修复 `bieze.ts` 和 `bazhuan.ts` 的三传推导
3. 更新所有受影响的测试 expected 值
4. 重新运行 kinliuren 交叉比对验证

### Phase 2: 提升 AI 解读质量
5. 设计问事类型 prompt 模板
6. 补充天将×地支吉凶矩阵到 prompt
7. 添加应期推算规则
8. 优化离线 fallback 解读

### Phase 3: 验证与打磨
9. 扩大交叉比对测试覆盖（增加更多案例）
10. 验证节气计算精度
11. 验证子时跨日处理
12. UI 组件与 Horosa/命语 对比优化
