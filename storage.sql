-- Supabase Storage Buckets and RLS Setup
-- Run this script in the Supabase SQL Editor to initialize buckets and security policies.

-- =========================================================================
-- 1. BUCKETS CREATION
-- =========================================================================

-- Insert buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('device-images', 'device-images', true),
  ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- 2. STORAGE POLICIES (storage.objects RLS)
-- =========================================================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

---------------------------------------------------------------------------
-- A. device-images (Publicly viewable, insertable during checkout)
---------------------------------------------------------------------------

-- Allow anyone to view device images
CREATE POLICY "Allow public read access to device-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'device-images');

-- Allow anonymous or authenticated clients to upload device images
CREATE POLICY "Allow anyone to upload device-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'device-images');

-- Allow admins/sub-admins to delete device images
CREATE POLICY "Allow staff to delete device-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'device-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'sub_admin')
  );


---------------------------------------------------------------------------
-- B. payment-proofs (Private, only visible to uploader and staff)
---------------------------------------------------------------------------

-- Allow uploader and staff to view payment proofs
-- Naming convention: proofs must be uploaded with prefix folder matching customer_id/booking_id or uuid
CREATE POLICY "Allow uploader or staff to view payment-proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs' AND (
      -- Staff can read all proofs
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'sub_admin') OR
      -- Or if the object matches the customer's user ID folder
      (auth.uid()::text = (split_part(name, '/', 1)))
    )
  );

-- Allow upload of payment proofs
CREATE POLICY "Allow upload of payment-proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs' AND (
      -- Admins/Sub-admins can upload anything
      (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'sub_admin') OR
      -- Logged in user can upload to their own folder: folder_name must equal auth.uid()
      (auth.uid()::text = (split_part(name, '/', 1))) OR
      -- Anonymous upload allowed if it goes into an unassigned queue (checked by backend)
      (auth.uid() IS NULL)
    )
  );

-- Only admins/sub-admins can delete payment proofs
CREATE POLICY "Allow staff to delete payment-proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-proofs' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'sub_admin')
  );
