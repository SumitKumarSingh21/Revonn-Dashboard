
-- Add INSERT policy for earnings table to allow garage owners to create earnings records
CREATE POLICY "Garage owners can create earnings for their garage" 
  ON public.earnings 
  FOR INSERT 
  WITH CHECK (
    garage_id IN (
      SELECT id 
      FROM garages 
      WHERE owner_id = auth.uid()
    )
  );

-- Add UPDATE and DELETE policies for completeness
CREATE POLICY "Garage owners can update their earnings" 
  ON public.earnings 
  FOR UPDATE 
  USING (
    garage_id IN (
      SELECT id 
      FROM garages 
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Garage owners can delete their earnings" 
  ON public.earnings 
  FOR DELETE 
  USING (
    garage_id IN (
      SELECT id 
      FROM garages 
      WHERE owner_id = auth.uid()
    )
  );
