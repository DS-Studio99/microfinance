-- ==========================================================
-- Run this script in the Supabase SQL Editor
-- to add the necessary columns for the new features.
-- ==========================================================

-- Add 'note' column to 'book_collections'
ALTER TABLE book_collections
ADD COLUMN IF NOT EXISTS note TEXT;

-- Add 'collection_day' column to 'vo_groups'
ALTER TABLE vo_groups
ADD COLUMN IF NOT EXISTS collection_day TEXT;

-- Add 'is_late_payer' column to 'members'
ALTER TABLE members
ADD COLUMN IF NOT EXISTS is_late_payer BOOLEAN DEFAULT false;
