
-- Create a table to store available time slots for garages
CREATE TABLE public.garage_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.garage_time_slots ENABLE ROW LEVEL SECURITY;

-- Policy for garage owners to manage their time slots
CREATE POLICY "Garage owners can manage their time slots" 
  ON public.garage_time_slots 
  FOR ALL 
  USING (garage_id IN (SELECT id FROM public.garages WHERE owner_id = auth.uid()));

-- Policy for anyone to view available time slots (needed for booking)
CREATE POLICY "Anyone can view garage time slots" 
  ON public.garage_time_slots 
  FOR SELECT 
  USING (true);

-- Add index for better performance
CREATE INDEX idx_garage_time_slots_garage_day 
  ON public.garage_time_slots(garage_id, day_of_week);
