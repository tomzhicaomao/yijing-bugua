## Context

当前项目 `yijing-bugua-new` 的 `src/data/hexagrams.json` 仅包含 8 卦完整数据。古典原文来源为 `周易卦辞卦序.xls`（10 个 Sheet，含全部 64 卦原文），但该文件使用 CJK 兼容表意文字编码（如 六 U+F9D1 而非 六 U+516D），需 NFKC 归一化处理。项目已集成 DeepSeek API（`src/ai/`），使用 double-call 架构。

约束：
- 数据提取脚本不打包入运行时 bundle
- 译文风格须学术严谨，参照黄寿祺《周易译注》
- 现有 `HexagramData` 接口需向后兼容扩展
- Python 脚本仅在开发环境运行

## Goals / Non-Goals

**Goals:**
- 从 Excel 提取全部 64 卦古典原文（卦辞、彖辞、大象、爻辞、小象）
- 生成学术严谨的白话译文（judgmentModern、imageModern、lines[].modern、lines[].smallImageModern）
- 自动生成卦名拼音并人工验证多音字
- 输出完整 `hexagrams.json`，替换现有 8 卦数据
- 乾加用九、坤加用六（position: 0 的特殊爻）
- TypeScript 类型同步更新

**Non-Goals:**
- 不翻译彖辞（彖曰）——仅作为 AI 翻译上下文使用
- 不包含英文翻译（Wilhelm/Baynes 等）
- 不生成注释或学术考据
- 不修改 AI 解读的 prompt 逻辑（只替换数据源）

## Decisions

### Decision 1: 三阶段管道架构

```
Phase 1: extract_hexagram_data.py
  输入: 周易卦辞卦序.xls
  输出: hexagrams_raw.json (64 条，仅古典原文，无白话/拼音)

Phase 2: translate_hexagrams.py
  输入: hexagrams_raw.json + DeepSeek API
  输出: hexagrams_translated.json (增加所有 Modern 字段)

Phase 3: generate_pinyin.py
  输入: hexagrams_translated.json + pypinyin
  输出: src/data/hexagrams.json (最终文件)
```

**理由**: 每阶段可独立运行和验证。Phase 1 的输出（纯原文）可复用。翻译失败不需重新解析 Excel。拼音生成是确定性步骤，适合最后执行。

**替代方案考虑**: 合并为单脚本 → 被拒绝，因为翻译调用可能失败需重试，合并后调试困难。

### Decision 2: 中间 JSON 的结构

Phase 1 输出的中间 JSON 包含所有古典原文字段，但用 `null` 占位 Modern 字段，保持与最终格式一致的结构，Phase 2 和 Phase 3 只需填充 null 字段。

### Decision 3: Excel 解析策略

- **64 卦 trigram 映射**: 从 Sheet '64卦' 读取上卦数字/下卦数字 → 查 Sheet '8卦' 得 trigram 符号
- **卦辞/彖辞/大象**: 从 Sheet '卦辭' Col[2] 解析，按「彖曰」「象曰」标记切分
- **爻辞/小象**: 从 Sheet '周易大象' 逐行读取，格式为 `爻名：爻辞。象曰：小象辞。`
- **乾卦特殊处理**: 周易大象中乾卦 6 行不含象曰（是文言），爻辞从卦辭 Sheet 的文言之前段落提取
- **NFKC 归一化**: 所有文本读取后立即执行 `unicodedata.normalize('NFKC', text)`

### Decision 4: 翻译 Prompt 设计

采用学术严谨风格的 system prompt，要求逐字对应、保留关键哲学术语（元亨利贞、吉凶悔吝、无咎等），参照黄寿祺《周易译注》风格。每条翻译请求携带上下文：彖辞全文 + 大象全文 + 目标爻的小象（如有），确保 AI 理解整卦逻辑后再翻译。

### Decision 5: TypeScript 类型扩展

```typescript
export interface HexagramLineData {
  position: number       // 1-6 为六爻, 0 为用九/用六
  name: string           // 初九、六二、...、用九、用六
  text: string           // 爻辞原文
  modern: string         // 爻辞白话
  smallImage?: string    // 小象原文（乾用九/坤用六为 null）
  smallImageModern?: string  // 小象白话
}
```

向后兼容：新增字段均为可选。现有代码中只读 `text`/`modern` 的路径不受影响。

## Risks / Trade-offs

- **[译文质量] DeepSeek 可能对冷僻卦辞给出不准确翻译** → 缓解：prompt 提供彖辞/象辞上下文；随机抽取 10 卦与出版物对照；支持单独重译单卦
- **[Unicode 归一化遗漏]** → 缓解：Phase 1 输出后运行验证脚本，检查是否存在 Compatibility Ideograph 字符
- **[Excel 行序不保证]** → 缓解：按卦序字段排序，不依赖 Excel 行号
- **[API 调用成本]** → 约 64 × (1 卦辞 + 1 大象 + 6–7 爻辞) ≈ 550 条翻译请求，按 DeepSeek 定价约 ¥3-5 总成本
- **[乾卦文言格式特殊]** → 缓解：硬编码乾卦爻辞提取逻辑，确保从正确位置取爻辞原文
- **[多音字]** → 缓解：维护已知多音字清单（否 pǐ、观 guān、渐 jiàn 等），Phase 3 后人工审查

## Open Questions

- 用九/用六的 `smallImage` 字段：乾卦用九有对应小象吗？需检查原始文本确认
- 是否需要保存彖辞（彖曰）字段到最终 JSON？当前设计仅将其作为 AI 翻译上下文，不输出到 hexagrams.json
