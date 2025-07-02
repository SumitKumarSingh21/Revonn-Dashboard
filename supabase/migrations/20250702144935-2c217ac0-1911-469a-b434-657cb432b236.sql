
-- Create mechanics table
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL REFERENCES public.garages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  mechanic_id TEXT NOT NULL UNIQUE, -- Auto-generated unique ID like "MECH001"
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add mechanic assignment columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN assigned_mechanic_id UUID REFERENCES public.mechanics(id),
ADD COLUMN assigned_mechanic_name TEXT,
ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS for mechanics table
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;

-- RLS policies for mechanics
CREATE POLICY "Garage owners can view their mechanics" 
  ON public.mechanics 
  FOR SELECT 
  USING (garage_id IN (
    SELECT id FROM public.garages WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Garage owners can create mechanics for their garage" 
  ON public.mechanics 
  FOR INSERT 
  WITH CHECK (garage_id IN (
    SELECT id FROM public.garages WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Garage owners can update their mechanics" 
  ON public.mechanics 
  FOR UPDATE 
  USING (garage_id IN (
    SELECT id FROM public.garages WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Garage owners can delete their mechanics" 
  ON public.mechanics 
  FOR DELETE 
  USING (garage_id IN (
    SELECT id FROM public.garages WHERE owner_id = auth.uid()
  ));

-- Function to generate unique mechanic ID
CREATE OR REPLACE FUNCTION generate_mechanic_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'MECH' || LPAD(counter::TEXT, 3, '0');
    
    IF NOT EXISTS (SELECT 1 FROM public.mechanics WHERE mechanic_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate mechanic ID
CREATE OR REPLACE FUNCTION set_mechanic_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mechanic_id IS NULL OR NEW.mechanic_id = '' THEN
    NEW.mechanic_id := generate_mechanic_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_mechanic_id
  BEFORE INSERT ON public.mechanics
  FOR EACH ROW
  EXECUTE FUNCTION set_mechanic_id();

-- Function to update booking when mechanic is assigned
CREATE OR REPLACE FUNCTION update_booking_mechanic_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update assigned_mechanic_name when assigned_mechanic_id changes
  IF NEW.assigned_mechanic_id IS NOT NULL AND NEW.assigned_mechanic_id != OLD.assigned_mechanic_id THEN
    SELECT name INTO NEW.assigned_mechanic_name 
    FROM public.mechanics 
    WHERE id = NEW.assigned_mechanic_id;
    
    NEW.assigned_at := NOW();
  ELSIF NEW.assigned_mechanic_id IS NULL THEN
    NEW.assigned_mechanic_name := NULL;
    NEW.assigned_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_mechanic_assignment
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_mechanic_assignment();

-- Enable realtime for mechanics table
ALTER TABLE public.mechanics REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mechanics;

-- Insert some sample mechanics for existing garages
INSERT INTO public.mechanics (garage_id, name, phone, email)
SELECT 
  g.id,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 1 THEN 'Rajesh Kumar'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 2 THEN 'Amit Singh'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 3 THEN 'Suresh Patel'
    ELSE 'Mechanic ' || ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id)
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 1 THEN '+91-9876543210'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 2 THEN '+91-9876543211'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 3 THEN '+91-9876543212'
    ELSE '+91-987654321' || ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id)
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 1 THEN 'rajesh@example.com'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 2 THEN 'amit@example.com'
    WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) = 3 THEN 'suresh@example.com'
    ELSE 'mechanic' || ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY g.id) || '@example.com'
  END
FROM (
  SELECT id FROM public.garages
) g
CROSS JOIN generate_series(1, 3) AS series;
