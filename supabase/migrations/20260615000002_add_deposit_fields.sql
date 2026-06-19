-- Add optional fields to deposits table
ALTER TABLE public.deposits 
ADD COLUMN IF NOT EXISTS screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Create storage bucket for deposit screenshots if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deposit_screenshots', 'deposit_screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for the new bucket
-- Allow public access to view screenshots
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'deposit_screenshots' );

-- Allow authenticated users to upload screenshots
CREATE POLICY "Users can upload screenshots" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'deposit_screenshots' AND auth.role() = 'authenticated' );
