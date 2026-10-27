-- SproutBox Database Schema
-- Run this in the Supabase SQL Editor

-- ════════════════════════════════════════════════
-- 1. Profiles (extends Supabase auth.users)
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'grower' CHECK (role IN ('grower', 'restaurant', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'grower')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ════════════════════════════════════════════════
-- 2. Tray Assignments
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.tray_assignments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grower_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tray_code             TEXT NOT NULL,
  crop_name             TEXT NOT NULL,
  start_date            DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_harvest_date DATE NOT NULL,
  status                TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'growing', 'qc_pending', 'approved', 'completed')),
  current_day           INT NOT NULL DEFAULT 1,
  total_days            INT NOT NULL DEFAULT 7,
  seed_type             TEXT NOT NULL DEFAULT 'Unknown',
  seed_batch_id         TEXT NOT NULL DEFAULT 'SB-000',
  seed_quantity_grams   NUMERIC NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tray_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers can view own trays"
  ON public.tray_assignments FOR SELECT
  USING (auth.uid() = grower_id);

CREATE POLICY "Admins can manage trays"
  ON public.tray_assignments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert trays"
  ON public.tray_assignments FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════
-- 3. Daily Instructions
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_instructions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tray_id       UUID NOT NULL REFERENCES public.tray_assignments(id) ON DELETE CASCADE,
  day_number    INT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  is_completed  BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.daily_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers can view own instructions"
  ON public.daily_instructions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.tray_assignments WHERE id = tray_id AND grower_id = auth.uid())
  );

CREATE POLICY "Growers can update own instructions"
  ON public.daily_instructions FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.tray_assignments WHERE id = tray_id AND grower_id = auth.uid())
  );

-- ════════════════════════════════════════════════
-- 4. Milestones
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tray_id     UUID NOT NULL REFERENCES public.tray_assignments(id) ON DELETE CASCADE,
  day_number  INT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  image_url   TEXT
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers can view own milestones"
  ON public.milestones FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.tray_assignments WHERE id = tray_id AND grower_id = auth.uid())
  );

-- ════════════════════════════════════════════════
-- 5. Growth Uploads
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.growth_uploads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tray_id     UUID NOT NULL REFERENCES public.tray_assignments(id) ON DELETE CASCADE,
  day_number  INT NOT NULL,
  image_url   TEXT NOT NULL,
  notes       TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.growth_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers can manage own uploads"
  ON public.growth_uploads FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.tray_assignments WHERE id = tray_id AND grower_id = auth.uid())
  );

-- ════════════════════════════════════════════════
-- 6. Yield Records
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.yield_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tray_id         UUID NOT NULL REFERENCES public.tray_assignments(id) ON DELETE CASCADE,
  weight_grams    NUMERIC NOT NULL,
  quality_rating  INT NOT NULL CHECK (quality_rating BETWEEN 1 AND 5),
  notes           TEXT,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yield_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Growers can manage own yields"
  ON public.yield_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.tray_assignments WHERE id = tray_id AND grower_id = auth.uid())
  );

-- ════════════════════════════════════════════════
-- 7. Storage Bucket for growth images
-- ════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('growth-images', 'growth-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'growth-images');

CREATE POLICY "Anyone can view growth images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'growth-images');

-- ════════════════════════════════════════════════
-- 8. Orders
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  items           JSONB NOT NULL DEFAULT '[]',
  total_trays     INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned_to_growers', 'growing', 'ready_for_harvest', 'delivered')),
  delivery_date   DATE NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants can manage own orders"
  ON public.orders FOR ALL
  USING (auth.uid() = restaurant_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════
-- 9. Subscriptions
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  items           JSONB NOT NULL DEFAULT '[]',
  frequency       TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'biweekly')),
  next_delivery   DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants can manage own subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.uid() = restaurant_id);

-- ════════════════════════════════════════════════
-- 10. Feedback
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants can manage own feedback"
  ON public.feedback FOR ALL
  USING (auth.uid() = restaurant_id);

CREATE POLICY "Admins can view all feedback"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════
-- 11. Allocations
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.allocations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tray_id         UUID NOT NULL REFERENCES public.tray_assignments(id) ON DELETE CASCADE,
  grower_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all allocations"
  ON public.allocations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert allocations"
  ON public.allocations FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ════════════════════════════════════════════════
-- 12. Fix Core Profile Select Loops (Admin Override)
-- ════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_sprout_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles bypass"
  ON public.profiles FOR SELECT
  USING (public.is_sprout_admin());

-- ════════════════════════════════════════════════
-- 13. Invoices
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grower_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  invoice_number  TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal        NUMERIC NOT NULL DEFAULT 0,
  tax_amount      NUMERIC NOT NULL DEFAULT 0,
  total_amount    NUMERIC NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'INR',
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Restaurants can view own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = restaurant_id);

CREATE POLICY "Growers can view invoices for their trays"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.allocations a
      JOIN public.tray_assignments ta ON a.tray_id = ta.id
      WHERE a.order_id = invoices.order_id AND ta.grower_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all invoices"
  ON public.invoices FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_updated_at ON public.invoices;
CREATE TRIGGER update_invoice_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_invoice_updated_at();
