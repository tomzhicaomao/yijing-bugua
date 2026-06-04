-- ============================================================
-- 易经占卜 Cloud Sync - Initial Schema Migration
-- Created: 2026-05-30
-- ============================================================

-- ============================================================
-- 1. Helper: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. records table (占卜记录)
-- ============================================================
CREATE TABLE records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schema_version INT NOT NULL DEFAULT 1,
  timestamp TIMESTAMPTZ NOT NULL,
  question TEXT NOT NULL,
  category VARCHAR(20) NOT NULL,
  method VARCHAR(10) NOT NULL,
  before_divination JSONB,
  hexagram JSONB NOT NULL,
  interpretations JSONB DEFAULT '[]'::jsonb,
  feedback JSONB NOT NULL,
  duplicate JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_timestamp ON records(timestamp DESC);
CREATE INDEX idx_records_category ON records(category);
CREATE INDEX idx_records_feedback_status ON records((feedback->>'status'));
CREATE INDEX idx_records_feedback_due_at ON records((feedback->>'dueAt'));
CREATE INDEX idx_records_schema_version ON records(schema_version);

-- Auto-update updated_at on records
CREATE TRIGGER trg_records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. user_settings table (用户设置)
-- ============================================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on user_settings
CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. Row Level Security (RLS)
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- records: Users can only access their own records
CREATE POLICY "Users can only access their own records"
  ON records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_settings: Users can only access their own settings
CREATE POLICY "Users can only access their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
