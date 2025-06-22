
-- Create storage bucket for garage images
INSERT INTO storage.buckets (id, name, public)
VALUES ('garage-images', 'garage-images', true);

-- Create storage policies for garage images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'garage-images');

CREATE POLICY "Authenticated users can upload garage images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'garage-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own garage images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'garage-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own garage images"
ON storage.objects FOR DELETE
USING (bucket_id = 'garage-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add RLS policies for garages table
CREATE POLICY "Users can view all garages"
ON public.garages FOR SELECT
USING (true);

CREATE POLICY "Users can create their own garage"
ON public.garages FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own garage"
ON public.garages FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own garage"
ON public.garages FOR DELETE
USING (auth.uid() = owner_id);
