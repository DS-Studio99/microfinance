-- ================================================================
-- মাইক্রোফাইন্যান্স সদস্য ব্যবস্থাপনা - Supabase Database Schema
-- Run these SQL statements in your Supabase SQL Editor
-- ================================================================

-- ---------------------------------------------------------------
-- TABLE 1: vo_groups
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vo_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vo_number INTEGER UNIQUE NOT NULL,
  vo_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vo_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users
CREATE POLICY "Allow authenticated read vo_groups"
  ON public.vo_groups FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert vo_groups"
  ON public.vo_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update vo_groups"
  ON public.vo_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete vo_groups"
  ON public.vo_groups FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------
-- TABLE 2: members
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  father_name TEXT,
  village TEXT,
  post_office TEXT,
  upazila TEXT,
  district TEXT,
  phone_number TEXT,
  vo_number INTEGER NOT NULL,
  loan_amount NUMERIC,
  is_due BOOLEAN DEFAULT false,
  is_called BOOLEAN DEFAULT false,
  loan_payment_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users
CREATE POLICY "Allow authenticated read members"
  ON public.members FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert members"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update members"
  ON public.members FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete members"
  ON public.members FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------
-- Optional: Function to auto-update updated_at timestamp
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- DONE! Your database is ready.
-- 
-- Next steps:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Create an admin user manually (Invite User or Add User)
-- 3. Copy your Project URL and Anon Key from:
--    Settings → API → Project URL & anon public key
-- 4. Add them to your .env file:
--    VITE_SUPABASE_URL=https://xxxx.supabase.co
--    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
-- ================================================================
