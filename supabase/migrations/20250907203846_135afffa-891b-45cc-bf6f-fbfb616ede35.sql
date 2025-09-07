
-- Create a policy to allow public verification of mechanics
-- This is needed for the QR code verification to work publicly
CREATE POLICY "Anyone can verify mechanics by mechanic_id" 
  ON public.mechanics 
  FOR SELECT 
  USING (true);

-- Also need to allow public access to garage information for verification
CREATE POLICY "Anyone can view garage info for mechanic verification" 
  ON public.garages 
  FOR SELECT 
  USING (true);
