-- ================================================================
-- Add is_disabled column to vo_groups for VO enable/disable feature
-- ================================================================

ALTER TABLE vo_groups ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;
