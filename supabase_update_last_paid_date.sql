-- ================================================================
-- Add last_paid_date to members table
-- ================================================================

ALTER TABLE members ADD COLUMN IF NOT EXISTS last_paid_date DATE DEFAULT NULL;
