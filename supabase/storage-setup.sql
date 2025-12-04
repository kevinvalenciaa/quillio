-- ============================================
-- QUILLIO STORAGE SETUP
-- Run this in Supabase SQL Editor after schema.sql
-- ============================================

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-captures',
  'audio-captures',
  false,
  10485760, -- 10MB max file size
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio bucket
CREATE POLICY "Users can upload own audio"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'audio-captures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own audio"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'audio-captures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own audio"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'audio-captures' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- ENABLE REALTIME for key tables
-- ============================================

-- Enable realtime for captures (for quick updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.captures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.priorities;

-- ============================================
-- DONE! Storage and realtime are now configured.
-- ============================================

