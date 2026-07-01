-- records 表添加年命快照字段
ALTER TABLE records
ADD COLUMN IF NOT EXISTS nian_ming JSONB;
-- 结构: { "yearGanZhi": "甲子", "age": 30, "xingNian": "丙寅" }
