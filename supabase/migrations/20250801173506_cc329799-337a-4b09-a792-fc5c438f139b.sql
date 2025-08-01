
-- First, let's create a table to handle multiple services per booking
CREATE TABLE public.booking_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  service_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for the booking_services table
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for booking_services
CREATE POLICY "Garage owners can view booking services for their garages"
  ON public.booking_services
  FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN garages g ON b.garage_id = g.id
      WHERE g.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view booking services for their bookings"
  ON public.booking_services
  FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create booking services"
  ON public.booking_services
  FOR INSERT
  WITH CHECK (true);

-- Create predefined time slots for all garages
CREATE TABLE public.predefined_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(garage_id, day_of_week, start_time)
);

-- Enable RLS for predefined_time_slots
ALTER TABLE public.predefined_time_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for predefined_time_slots
CREATE POLICY "Anyone can view predefined time slots"
  ON public.predefined_time_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Garage owners can manage their predefined time slots"
  ON public.predefined_time_slots
  FOR ALL
  USING (
    garage_id IN (
      SELECT id FROM garages WHERE owner_id = auth.uid()
    )
  );

-- Function to generate predefined time slots for a garage
CREATE OR REPLACE FUNCTION generate_predefined_time_slots(p_garage_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  day_num INTEGER;
  time_slot TIME;
BEGIN
  -- Loop through days (0 = Sunday, 1 = Monday, etc.)
  FOR day_num IN 0..6 LOOP
    -- Loop through time slots from 9 AM to 8 PM (last slot starts at 8 PM)
    FOR hour_offset IN 0..11 LOOP
      time_slot := '09:00:00'::TIME + (hour_offset || ' hours')::INTERVAL;
      
      INSERT INTO public.predefined_time_slots (
        garage_id,
        day_of_week,
        start_time,
        end_time,
        is_available
      ) VALUES (
        p_garage_id,
        day_num,
        time_slot,
        time_slot + '1 hour'::INTERVAL,
        true
      ) ON CONFLICT (garage_id, day_of_week, start_time) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

-- Trigger to automatically generate predefined time slots when a new garage is created
CREATE OR REPLACE FUNCTION trigger_generate_predefined_slots()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM generate_predefined_time_slots(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_predefined_slots_trigger
  AFTER INSERT ON public.garages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_predefined_slots();

-- Generate predefined time slots for existing garages
DO $$
DECLARE
  garage_record RECORD;
BEGIN
  FOR garage_record IN SELECT id FROM public.garages LOOP
    PERFORM generate_predefined_time_slots(garage_record.id);
  END LOOP;
END;
$$;
