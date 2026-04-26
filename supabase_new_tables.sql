-- ================================================================
-- নতুন টেবিল: loan_applications (নতুন লোন আবেদন)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  full_address TEXT,
  vo_number INTEGER,
  member_number TEXT,
  birth_date DATE,
  card_type TEXT DEFAULT 'NID',
  id_number TEXT,
  father_name TEXT,
  mother_name TEXT,
  husband_name TEXT,
  -- Family info
  total_members INTEGER,
  total_children INTEGER,
  school_going INTEGER,
  under_five INTEGER,
  -- Loan info
  loan_amount NUMERIC,
  loan_purpose TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read loan_applications"
  ON public.loan_applications FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert loan_applications"
  ON public.loan_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update loan_applications"
  ON public.loan_applications FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete loan_applications"
  ON public.loan_applications FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ================================================================
-- নতুন টেবিল: book_collections (বই সংগ্রহ)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.book_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  vo_number INTEGER NOT NULL,
  membership_status TEXT DEFAULT 'running',  -- 'running' | 'cancelled'
  return_status TEXT DEFAULT 'with-me',       -- 'with-me' | 'returned'
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.book_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read book_collections"
  ON public.book_collections FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert book_collections"
  ON public.book_collections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update book_collections"
  ON public.book_collections FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete book_collections"
  ON public.book_collections FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ================================================================
-- members টেবিলে due_amount কলাম যোগ করুন (যদি না থাকে)
-- ================================================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS due_amount NUMERIC DEFAULT 0;
