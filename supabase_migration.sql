-- ─────────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → Database → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────────

-- Previous columns (if not already added)
ALTER TABLE members ADD COLUMN IF NOT EXISTS loan_cleared_date DATE DEFAULT NULL;
ALTER TABLE members ADD COLUMN IF NOT EXISTS extra_amount NUMERIC(12,2) DEFAULT NULL;

-- New columns
ALTER TABLE members ADD COLUMN IF NOT EXISTS expected_payment_date DATE DEFAULT NULL;
ALTER TABLE members ADD COLUMN IF NOT EXISTS extra_amount_date DATE DEFAULT NULL;
ALTER TABLE members ADD COLUMN IF NOT EXISTS extra_amount_note TEXT DEFAULT NULL;

-- Member number (unique ID per member, set manually)
ALTER TABLE members ADD COLUMN IF NOT EXISTS member_number VARCHAR(50) DEFAULT NULL;

-- Additional phone numbers
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_number_2 VARCHAR(20) DEFAULT NULL;
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone_number_3 VARCHAR(20) DEFAULT NULL;

-- ─────────────────────────────────────────────────────────────────
-- AUTO OVERDUE TRIGGER
-- When loan_payment_date passes today, automatically set is_due = true
-- This trigger fires on INSERT or UPDATE of any member row
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auto_mark_overdue()
RETURNS TRIGGER AS $$
BEGIN
  -- If loan_payment_date is set and has passed today, mark as due
  IF NEW.loan_payment_date IS NOT NULL
     AND NEW.loan_payment_date < CURRENT_DATE
     AND NEW.loan_cleared_date IS NULL  -- not yet cleared
  THEN
    NEW.is_due := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_overdue ON members;
CREATE TRIGGER trigger_auto_overdue
  BEFORE INSERT OR UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_overdue();

-- ─────────────────────────────────────────────────────────────────
-- BACKFILL: mark existing members as overdue if their date has passed
-- ─────────────────────────────────────────────────────────────────
UPDATE members
SET is_due = true
WHERE loan_payment_date IS NOT NULL
  AND loan_payment_date < CURRENT_DATE
  AND loan_cleared_date IS NULL
  AND is_due = false;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'members'
  AND column_name IN (
    'loan_cleared_date','extra_amount',
    'expected_payment_date','extra_amount_date','extra_amount_note'
  )
ORDER BY column_name;
