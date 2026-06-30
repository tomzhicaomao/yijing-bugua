-- =====================================================
-- 大六壬集成 · 回滚脚本
-- =====================================================
-- 回滚新增的大六壬字段

-- 1. 删除索引
DROP INDEX IF EXISTS idx_records_liuren_pan;
DROP INDEX IF EXISTS idx_records_method;

-- 2. 删除列
ALTER TABLE records DROP COLUMN IF EXISTS liuren_pan;
ALTER TABLE records DROP COLUMN IF EXISTS interpretation;
