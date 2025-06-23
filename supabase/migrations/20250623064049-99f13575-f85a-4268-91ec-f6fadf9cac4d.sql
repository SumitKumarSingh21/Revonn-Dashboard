
-- Add RLS policies for services table
CREATE POLICY "Users can view all services"
ON public.services FOR SELECT
USING (true);

CREATE POLICY "Garage owners can create services for their garage"
ON public.services FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = garage_id 
    AND garages.owner_id = auth.uid()
  )
);

CREATE POLICY "Garage owners can update their garage services"
ON public.services FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = garage_id 
    AND garages.owner_id = auth.uid()
  )
);

CREATE POLICY "Garage owners can delete their garage services"
ON public.services FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = garage_id 
    AND garages.owner_id = auth.uid()
  )
);
