-- ================================================================
-- شواهد تعليمية — Database Schema v1.0
-- يُنفَّذ في Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. جدول المعلمين (Teachers)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.teachers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT '',
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT DEFAULT NULL,
  gender        TEXT CHECK (gender IN ('male', 'female')) DEFAULT NULL,
  school        TEXT DEFAULT NULL,
  subject       TEXT DEFAULT NULL,
  is_complete   BOOLEAN DEFAULT FALSE,  -- هل أكمل ملفه الشخصي
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_teachers_auth_id ON public.teachers(auth_id);
CREATE INDEX IF NOT EXISTS idx_teachers_email   ON public.teachers(email);

-- ================================================================
-- 2. جدول التقارير (Reports)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  grade           TEXT NOT NULL DEFAULT '',
  subject         TEXT NOT NULL DEFAULT '',
  activity_type   TEXT NOT NULL DEFAULT '',
  description     TEXT DEFAULT NULL,
  objectives      TEXT DEFAULT NULL,
  steps           TEXT DEFAULT NULL,
  outcomes        TEXT DEFAULT NULL,
  tools           TEXT DEFAULT NULL,
  evaluation      TEXT DEFAULT NULL,
  criteria_id     TEXT DEFAULT NULL,
  criteria_label  TEXT DEFAULT NULL,
  teacher_gender  TEXT DEFAULT 'male',
  status          TEXT CHECK (status IN ('draft','ready','shared')) DEFAULT 'ready',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_teacher_id ON public.reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ================================================================
-- 3. جدول صور التقارير (Report Images)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.report_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id    UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,            -- المسار في Supabase Storage
  is_blurred   BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_images_report_id ON public.report_images(report_id);

-- ================================================================
-- 4. Row Level Security (RLS)
-- ================================================================

-- تفعيل RLS
ALTER TABLE public.teachers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_images ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المعلمين
CREATE POLICY "teacher_own_read"   ON public.teachers FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "teacher_own_insert" ON public.teachers FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "teacher_own_update" ON public.teachers FOR UPDATE USING (auth.uid() = auth_id);

-- سياسات جدول التقارير
CREATE POLICY "report_own_select" ON public.reports FOR SELECT
  USING (teacher_id IN (SELECT id FROM public.teachers WHERE auth_id = auth.uid()));

CREATE POLICY "report_own_insert" ON public.reports FOR INSERT
  WITH CHECK (teacher_id IN (SELECT id FROM public.teachers WHERE auth_id = auth.uid()));

CREATE POLICY "report_own_update" ON public.reports FOR UPDATE
  USING (teacher_id IN (SELECT id FROM public.teachers WHERE auth_id = auth.uid()));

CREATE POLICY "report_own_delete" ON public.reports FOR DELETE
  USING (teacher_id IN (SELECT id FROM public.teachers WHERE auth_id = auth.uid()));

-- سياسات صور التقارير
CREATE POLICY "images_own_select" ON public.report_images FOR SELECT
  USING (report_id IN (
    SELECT r.id FROM public.reports r
    JOIN public.teachers t ON r.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

CREATE POLICY "images_own_insert" ON public.report_images FOR INSERT
  WITH CHECK (report_id IN (
    SELECT r.id FROM public.reports r
    JOIN public.teachers t ON r.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

CREATE POLICY "images_own_delete" ON public.report_images FOR DELETE
  USING (report_id IN (
    SELECT r.id FROM public.reports r
    JOIN public.teachers t ON r.teacher_id = t.id
    WHERE t.auth_id = auth.uid()
  ));

-- ================================================================
-- 5. Function: تحديث updated_at تلقائياً
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teachers_updated BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- 6. Function: إنشاء سجل المعلم تلقائياً عند التسجيل
-- ================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teachers (auth_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 7. Storage Bucket — Private
-- ================================================================
-- نُنفذ هذا عبر Supabase Dashboard أو API:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('report-images', 'report-images', FALSE);

-- Storage RLS
-- CREATE POLICY "auth_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "auth_read" ON storage.objects FOR SELECT
--   USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "auth_delete" ON storage.objects FOR DELETE
--   USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);
