
-- Create table for storing push notification tokens
CREATE TABLE public.garage_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(garage_id, push_token)
);

-- Enable RLS for push tokens
ALTER TABLE public.garage_push_tokens ENABLE ROW LEVEL SECURITY;

-- Allow garage owners to manage their push tokens
CREATE POLICY "Garage owners can manage their push tokens" 
  ON public.garage_push_tokens 
  FOR ALL
  USING (garage_id IN (
    SELECT id FROM public.garages WHERE owner_id = auth.uid()
  ));
