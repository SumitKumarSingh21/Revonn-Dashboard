
-- Add photo_url column to mechanics table
ALTER TABLE public.mechanics 
ADD COLUMN photo_url text;

-- Create storage bucket for mechanic photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mechanic-photos', 'mechanic-photos', true);

-- Create storage policy for mechanic photos
CREATE POLICY "Garage owners can upload mechanic photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mechanic-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view mechanic photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mechanic-photos');

CREATE POLICY "Garage owners can update mechanic photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'mechanic-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Garage owners can delete mechanic photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'mechanic-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
