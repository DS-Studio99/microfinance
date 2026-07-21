-- ================================================================
-- Add fields for Loan Disbursement Date and Savings Withdrawal to loan_applications
-- ================================================================

ALTER TABLE loan_applications
ADD COLUMN IF NOT EXISTS application_type TEXT DEFAULT 'loan',
ADD COLUMN IF NOT EXISTS disbursement_date DATE DEFAULT NULL;
