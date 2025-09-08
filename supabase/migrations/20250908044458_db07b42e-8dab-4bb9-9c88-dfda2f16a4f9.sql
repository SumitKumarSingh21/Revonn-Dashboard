-- Create garages storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('garages', 'garages', true);

-- Create RLS policies for garages bucket
CREATE POLICY "Allow authenticated users to upload garage images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'garages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to garage images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'garages');

CREATE POLICY "Allow garage owners to update their images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'garages' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow garage owners to delete their images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'garages' AND auth.uid()::text = (storage.foldername(name))[1]);