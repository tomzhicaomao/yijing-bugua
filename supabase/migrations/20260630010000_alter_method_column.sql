-- =====================================================
-- 扩展 method 列宽度
-- =====================================================
-- 原始 schema 定义 method VARCHAR(10)，但大六壬方法值
-- 'liuren-zhengshi'(16字符) 和 'liuren-huoshi'(14字符) 超出限制
-- 执行方式：在 Supabase Dashboard SQL Editor 中运行

ALTER TABLE records ALTER COLUMN method TYPE VARCHAR(20);
