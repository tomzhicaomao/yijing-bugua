## MODIFIED Requirements

### Requirement: 64 卦数据查询

系统 SHALL 支持按编号查询卦的完整数据，包括卦名、卦辞、象辞、爻辞、小象辞及对应的白话译文。

- 查询函数 MUST 为纯函数
- 数据来源 MUST 为项目内置 JSON 文件（不可学习）
- 数据 MUST 覆盖全部 64 卦（卦序 1–64）
- 乾卦 lines 数组 MUST 包含用九爻（position: 0），坤卦 lines 数组 MUST 包含用六爻（position: 0）
- 每条爻数据 MUST 可选包含 smallImage（小象原文）和 smallImageModern（小象白话）

#### Scenario: 查询乾卦

- **WHEN** 查询编号 1 的卦
- **THEN** 返回完整数据包括 name、trigramUpper、trigramLower、judgment、judgmentModern、image、imageModern、lines（7 条，含 position: 0 的用九爻，每条含 smallImage 和 smallImageModern）

#### Scenario: 查询屯卦（常规 6 爻）

- **WHEN** 查询编号 3 的卦
- **THEN** 返回 6 条爻数据，全部 position 为 1–6，每条含 smallImage 和 smallImageModern

#### Scenario: 查询不存在编号

- **WHEN** 查询编号 0 或 65
- **THEN** 抛出明确错误或返回 null

### Requirement: 爻辞检索

系统 SHALL 根据卦编号和动爻位置返回对应的爻辞，包含小象辞和白话译文。

- 当有多个动爻时 MUST 返回所有对应爻辞
- 当无动爻时 MUST 返回本卦卦辞
- 动爻取用原则 MUST 明确：无动爻看本卦卦辞；一动爻重点看该爻辞；多动爻返回全部动爻爻辞并展示变卦作为趋势方向；六爻皆动时本卦与变卦并重

#### Scenario: 单动爻

- **WHEN** 本卦为 1（乾），动爻位置为 [3]
- **THEN** 返回乾卦九三爻辞，含原文、白话、小象原文、小象白话

#### Scenario: 无动爻（静卦）

- **WHEN** 本卦为 1（乾），动爻位置为 []
- **THEN** 返回乾卦卦辞

#### Scenario: 多动爻

- **WHEN** 本卦为 1（乾），动爻位置为 [2, 5]
- **THEN** 返回乾卦九二与九五爻辞，并保留动爻顺序

#### Scenario: 六爻皆动

- **WHEN** 动爻位置为 [1, 2, 3, 4, 5, 6]
- **THEN** 返回全部六条爻辞，并标记该卦为六爻皆动以供展示层强调本卦与变卦并重

## ADDED Requirements

### Requirement: 小象辞数据支持

系统 SHALL 在爻数据中提供小象辞（line-level image commentary）及其白话译文。

- HexagramLineData MUST 包含可选字段 smallImage 和 smallImageModern
- 乾卦用九爻和坤卦用六爻的 smallImage/smallImageModern MAY 为 null（如原始文本无对应小象）

#### Scenario: 查询爻数据含小象

- **WHEN** 查询乾卦初九爻
- **THEN** 返回对象包含 smallImage「潜龙勿用，阳在下也。」和 smallImageModern 白话译文
