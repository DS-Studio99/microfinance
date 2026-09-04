-- Migration script to add loan_disbursement_date column to members table
-- Run this in your Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS loan_disbursement_date DATE;
