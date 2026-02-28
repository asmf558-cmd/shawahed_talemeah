-- ================================================================
-- تشغيل هذا في Supabase SQL Editor بعد 001_schema.sql
-- ================================================================

-- إنشاء Private Bucket للصور
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-images',
  'report-images',
  FALSE,                          -- private — لا يمكن الوصول بدون توثيق
  10485760,                       -- 10MB حد أقصى لكل صورة
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS على Storage
CREATE POLICY "upload_own_images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "read_own_images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'report-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "delete_own_images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'report-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- تفعيل Email Auth في Supabase Dashboard:
-- Authentication > Providers > Email > Enable
-- Authentication > Settings > تفعيل "Enable email confirmations" (اختياري)
-- Authentication > Email Templates > تخصيص رسالة Magic Link بالعربية (اختياري)
