-- ==================== BẢNG EXAMS ====================
CREATE TABLE exams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            text NOT NULL,
  description      text,
  duration_minutes integer,
  available_from   timestamptz NOT NULL,
  expires_at       timestamptz NOT NULL,
  is_public        boolean NOT NULL DEFAULT false
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exams"
ON exams FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own exams"
ON exams FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exams"
ON exams FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own exams"
ON exams FOR DELETE TO authenticated
USING (user_id = auth.uid());


-- ==================== STORAGE POLICIES ====================
CREATE POLICY "Users can upload their own exams"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'exams' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own exams"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'exams' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own exams"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'exams' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own exams"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'exams' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow anon to read public exams"
ON exams
FOR SELECT
TO anon
USING (is_public = true);
