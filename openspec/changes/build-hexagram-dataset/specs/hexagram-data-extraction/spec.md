## ADDED Requirements

### Requirement: Excel 文件 NFKC 归一化

系统 SHALL 在读取 Excel 文件后，对所有文本内容执行 NFKC Unicode 归一化，将 CJK 兼容表意文字转换为标准汉字。

- 归一化 MUST 在文本提取后的第一时间执行
- 归一化后 MUST NOT 存在任何 Compatibility Ideograph 字符（U+F900–U+FAFF 范围）

#### Scenario: 兼容汉字归一化

- **WHEN** Excel 单元格包含字符 六（U+F9D1）、利（U+F9DD）、履（U+F9DF）、不（U+F967）、龍（U+F9C4）
- **THEN** 归一化后分别为 六、利、履、不、龍

#### Scenario: 全部 64 卦文本无残留兼容字

- **WHEN** Phase 1 提取完成全部 64 卦数据
- **THEN** 验证脚本扫描所有文本字段，确认不存在 U+F900–U+FAFF 范围内的字符

### Requirement: 64 卦 trigram 映射

系统 SHALL 从 '64卦' Sheet 读取每卦的上卦数字和下卦数字，通过 '8卦' Sheet 查询对应的 trigram 符号。

- 上卦符号 MUST 对应上卦数字（'64卦' Col[2]）
- 下卦符号 MUST 对应下卦数字（'64卦' Col[4]）
- 卦序 MUST 对应 '64卦' Col[5]
- 卦名 MUST 对应 '64卦' Col[6]

#### Scenario: 乾卦 trigram 映射

- **WHEN** 查询卦序为 1 的乾卦
- **THEN** 上卦数字为 1（天），符号为 ☰；下卦数字为 1（天），符号为 ☰

#### Scenario: 既济卦 trigram 映射

- **WHEN** 查询卦序为 63 的既济卦
- **THEN** 上卦数字为 6（水），符号为 ☵；下卦数字为 3（火），符号为 ☲

### Requirement: 卦辞/彖辞/大象解析

系统 SHALL 从 '卦辭' Sheet Col[2] 解析出卦辞（judgment）、彖辞、大象（image）三部分。

- 卦辞 MUST 为「卦名：」至「彖曰：」之间的文本
- 彖辞 MUST 为「彖曰：」至「象曰：」之间的文本（不含象曰标记）
- 大象 MUST 为「象曰：」至「文言曰：」（如有）或文本末尾之间的文本
- 乾、坤两卦 MUST 正确排除文言曰段落
- 所有段落 MUST 去除首尾空白和换行符

#### Scenario: 屯卦解析

- **WHEN** 解析卦序 3 屯卦的 Col[2]
- **THEN** judgment 为「屯：元，亨，利，贞，勿用，有攸往，利建侯。」；image 以「云，雷，屯；君子以经纶。」开头

#### Scenario: 乾卦解析（含文言）

- **WHEN** 解析卦序 1 乾卦的 Col[2]
- **THEN** judgment 为「乾：元，亨，利，贞。」；image 为「天行健，君子以自强不息。」；文言内容不出现在 image 中

### Requirement: 爻辞/小象逐行解析

系统 SHALL 从 '周易大象' Sheet 逐行读取每卦 6 爻的爻辞和小象。

- 爻名 MUST 从行首提取（如初九、六二、九三、上六）
- 爻辞 MUST 为爻名后至「象曰：」之前的文本
- 小象 MUST 为「象曰：」之后的文本
- 乾卦 MUST 使用硬编码逻辑处理（其周易大象行为文言格式，不含象曰标记）
- 每卦 MUST 恰好生成 6 条爻数据，position 为 1 至 6

#### Scenario: 屯卦初九爻解析

- **WHEN** 解析卦序 3 屯卦第 1 爻
- **THEN** name 为「初九」；text 为「磐桓；利居贞，利建侯。」；smallImage 为「虽磐桓，志行正也。以贵下贱，大得民也。」

#### Scenario: 乾卦初九爻解析（特殊格式）

- **WHEN** 解析卦序 1 乾卦第 1 爻（文言格式：初九曰：「潜龙勿用。」何谓也？子曰：...）
- **THEN** name 为「初九」；text 为「潜龙勿用。」

#### Scenario: 未济卦上九爻解析

- **WHEN** 解析卦序 64 未济卦第 6 爻
- **THEN** name 为「上九」；text 和 smallImage 均正确提取

### Requirement: 用九/用六特殊爻

系统 SHALL 为乾卦增加用九爻、为坤卦增加用六爻。

- 用九/用六爻 MUST 具有 position: 0
- 用九爻 name MUST 为「用九」，text MUST 为「见群龙无首，吉。」
- 用六爻 name MUST 为「用六」，text MUST 为「利永贞。」
- 其他 62 卦 MUST NOT 包含 position: 0 的爻
- 用九/用六的 smallImage 字段 MUST 检查原始文本确认有无对应小象

#### Scenario: 乾卦包含用九

- **WHEN** 查询乾卦的 lines 数组
- **THEN** 包含 7 条爻数据（6 条 position 1–6 + 1 条 position 0 的用九）

#### Scenario: 屯卦不包含用九/用六

- **WHEN** 查询卦序 3 屯卦的 lines 数组
- **THEN** 恰好 6 条爻数据，全部 position 为 1–6

### Requirement: 中间 JSON 输出

系统 SHALL 将 Phase 1 解析结果输出为 `hexagrams_raw.json`，结构完整但 Modern 字段为 null。

- 输出 MUST 以卦序字符串为 key（"1"–"64"）
- 每个卦对象 MUST 包含所有最终字段（judgmentModern、imageModern、lines[].modern、lines[].smallImageModern 为 null）
- 输出 MUST 按卦序升序排列
- 输出 MUST 为 UTF-8 编码

#### Scenario: Phase 1 输出结构完整

- **WHEN** 运行 extract_hexagram_data.py 完成
- **THEN** hexagrams_raw.json 包含 64 个 key（"1" 到 "64"），每个有完整的古典原文字段
