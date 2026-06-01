## Why

`hexagrams.json` 目前仅包含 8/64 卦的数据（乾、坤、屯、蒙、泰、否、既济、未济），缺少 56 卦。剩余的卦数据虽然有古典原文来源（Excel 文件），但缺乏学术严谨的白话译文和拼音，导致卦象引擎只能为 8 卦提供完整展示，AI 解读也缺少结构化数据支撑。本项目拥有完整《周易》原文的 Excel 文件，现在是完成全量数据集的最佳时机。

## What Changes

- 新增 **hexagram-data-extraction** 能力：从 Excel 文件解析全部 64 卦古典原文（卦辞、彖辞、大象、爻辞、小象），输出结构化中间数据
- 新增 **translation-generation** 能力：使用 DeepSeek API 批量生成学术严谨的白话译文，每条翻译携带彖辞/象辞上下文，风格参照黄寿祺《周易译注》
- 新增 **pinyin-generation** 能力：使用 pypinyin 库自动生成卦名拼音，多音字人工修正
- 修改 `hexagrams.json` 数据结构：增加 `smallImage`（小象辞）字段，乾卦增加「用九」爻、坤卦增加「用六」爻（position: 0）
- 扩展 `HexagramLineData` 类型：增加 `smallImage` 和 `smallImageModern` 可选字段
- 数据提取和翻译为独立 Python 脚本，运行于项目根目录（非运行时依赖）

## Capabilities

### New Capabilities

- `hexagram-data-extraction`: Excel 文件读取、NFKC Unicode 归一化、卦辞彖辞大象爻辞结构化解析、输出中间 JSON
- `translation-generation`: DeepSeek API 批量翻译，学术严谨 prompt 模板，彖辞/象辞上下文注入，翻译一致性保障
- `pinyin-generation`: pypinyin 自动拼音生成，多音字（否 pǐ、观 guān 等）人工验证清单

### Modified Capabilities

- `hexagram-engine`: 64 卦数据从 8 条扩展至 64 条全量；HexagramData 类型增加 `smallImage`/`smallImageModern` 字段；乾/坤的 lines 数组增加 position: 0 的特殊爻（用九/用六）

## Impact

- 影响文件：`src/data/hexagrams.json`（核心变更，从 8 卦扩展至 64 卦）
- 影响类型：`src/types/index.ts` 的 `HexagramLineData`（增加小象字段）
- 新增脚本：`scripts/extract_hexagram_data.py`（Excel 解析）、`scripts/translate_hexagrams.py`（DeepSeek 翻译）、`scripts/generate_pinyin.py`（拼音生成）
- 新增依赖（脚本）：`xlrd`（已安装）、`pypinyin`、`openai`（DeepSeek 兼容接口）
- 不影响运行时 bundle size（脚本不打包）
- 不影响现有占卜记录（数据结构向后兼容，仅增加可选字段）
