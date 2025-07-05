
-- Drop the existing policy that's causing the issue
DROP POLICY IF EXISTS "Garage owners can manage their time slots" ON public.garage_time_slots;

-- Create separate policies for different operations
CREATE POLICY "Garage owners can create their time slots" 
  ON public.garage_time_slots 
  FOR INSERT 
  WITH CHECK (garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid()));

CREATE POLICY "Garage owners can update their time slots" 
  ON public.garage_time_slots 
  FOR UPDATE 
  USING (garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid()));

CREATE POLICY "Garage owners can delete their time slots" 
  ON public.garage_time_slots 
  FOR DELETE 
  USING (garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid()));

CREATE POLICY "Garage owners can view their time slots" 
  ON public.garage_time_slots 
  FOR SELECT 
  USING (garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid()));
