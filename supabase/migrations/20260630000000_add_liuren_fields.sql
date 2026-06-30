-- =====================================================
-- 大六壬集成 · 数据库 Migration
-- =====================================================
-- 新增大六壬相关字段
-- 执行方式：在 Supabase Dashboard SQL Editor 中运行

-- 1. 新增大六壬课式字段（JSONB）
ALTER TABLE records 
  ADD COLUMN IF NOT EXISTS liuren_pan JSONB,
  ADD COLUMN IF NOT EXISTS interpretation JSONB;

-- 2. method 字段扩展注释
-- 允许值: 'virtual', 'manual', 'liuren-zhengshi', 'liuren-huoshi'
-- 无需修改约束，已有的 method 字段为 text 类型

-- 3. 创建索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_records_liuren_pan 
  ON records USING gin (liuren_pan) 
  WHERE liuren_pan IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_records_method 
  ON records (method) 
  WHERE method IS NOT NULL;

-- 4. RLS 策略更新（如果需要）
-- 现有的 RLS 策略应该已经覆盖了新列，因为是同一个表
-- 如果需要额外的列级权限，可以在这里添加

COMMENT ON COLUMN records.liuren_pan IS '大六壬完整课式数据（JSONB）';
COMMENT ON COLUMN records.interpretation IS 'AI 解读结果（JSONB）';
