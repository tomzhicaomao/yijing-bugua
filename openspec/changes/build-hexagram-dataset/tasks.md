## 1. 准备与依赖

- [x] 1.1 安装 Python 依赖：pypinyin、openai
- [x] 1.2 确认 xlrd 可用，确认 Excel 文件路径可访问
- [x] 1.3 创建 `scripts/` 目录结构
- [x] 1.4 验证 DeepSeek API Key 已配置且可用

## 2. Phase 1: Excel 古典原文提取

- [x] 2.1 实现 `scripts/extract_hexagram_data.py`：NFKC 归一化 + trigram 映射加载
- [x] 2.2 实现 '64卦' Sheet 解析：提取每卦上卦/下卦数字、卦序、卦名
- [x] 2.3 实现 '卦辭' Sheet 解析：切分卦辞/彖辞/大象，处理乾/坤文言特殊情况
- [x] 2.4 实现 '周易大象' Sheet 解析：逐行提取爻名、爻辞、小象，处理乾卦文言格式
- [x] 2.5 实现用九/用六特殊爻添加逻辑
- [x] 2.6 输出 `hexagrams_raw.json`，64 卦完整古典原文，Modern 字段为 null
- [x] 2.7 运行 Unicode 残留验证：确认无 U+F900–U+FAFF 字符
- [ ] 2.8 抽查 5 卦原文与权威出版物对照（乾、坤、屯、既济、未济）——将在 Phase 2 翻译完成后一并对照

## 3. Phase 2: DeepSeek 学术白话翻译

- [x] 3.1 实现 `scripts/translate_hexagrams.py`：加载 hexagrams_raw.json，初始化 DeepSeek 客户端
- [x] 3.2 编写学术严谨 system prompt 模板（逐字对应、保留哲学术语、黄寿祺风格）
- [x] 3.3 实现单卦翻译函数：传入彖辞+大象上下文，翻译卦辞、大象辞、爻辞、小象辞
- [x] 3.4 实现 API 重试逻辑（3 次重试，递增间隔）
- [x] 3.5 实现断点续译：检查已翻译字段，跳过非 null 的 Modern 值
- [x] 3.6 实现单卦重译参数（--hexagram N）
- [x] 3.7 运行全量翻译，输出 `hexagrams_translated.json`
- [x] 3.8 运行一致性验证：确认零 null Modern 字段、零空译文字段
- [ ] 3.9 随机抽取 10 卦译文与黄寿祺《周易译注》对照，记录差异率 —— 此任务在翻译完成后人工执行

## 4. Phase 3: 拼音生成

- [x] 4.1 实现 `scripts/generate_pinyin.py`
- [x] 4.2 配置 pypinyin 输出格式：小写、无声调、无空格
- [x] 4.3 维护多音字清单并输出人工验证列表
- [x] 4.4 运行拼音生成，写入 src/data/hexagrams.json
- [x] 4.5 修正多音字拼音：否(fou→pi)、屯(tun→zhun)、解(jie→xie)

## 5. TypeScript 类型与集成

- [x] 5.1 更新 `src/types/index.ts`：HexagramLineData 增加 smallImage、smallImageModern 可选字段
- [x] 5.2 更新 `src/engine/hexagram-lookup.ts`：适配新的 HexagramLineData 类型 —— 无需修改（向后兼容）
- [x] 5.3 将最终 JSON 复制到 `src/data/hexagrams.json`（generate_pinyin.py 直接输出至此）
- [x] 5.4 运行 TypeScript 编译检查，确认无类型错误
- [x] 5.5 运行现有单元测试，确认不破坏现有功能

## 6. 最终验证

- [x] 6.1 全量数据完整性检查：64 卦，每卦所有字段非空
- [x] 6.2 乾卦用九、坤卦用六验证：position: 0 爻存在且内容正确
- [x] 6.3 拼音格式验证：所有 namePinyin 匹配 `^[a-z]+$`
- [x] 6.4 运行项目 build，确认编译和打包正常
