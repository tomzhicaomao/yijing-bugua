-- user_settings 表添加年命字段
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS nian_ming JSONB;
-- 结构: { "gan": "甲", "zhi": "子" }
