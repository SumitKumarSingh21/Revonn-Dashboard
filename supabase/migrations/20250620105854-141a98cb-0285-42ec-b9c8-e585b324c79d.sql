
-- Enable Row Level Security on existing tables (skip if already enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'garages' AND rowsecurity = true) THEN
        ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'services' AND rowsecurity = true) THEN
        ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings' AND rowsecurity = true) THEN
        ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts' AND rowsecurity = true) THEN
        ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true) THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add columns to garages table
ALTER TABLE garages ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE garages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE garages ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "18:00", "closed": false}, "tuesday": {"start": "09:00", "end": "18:00", "closed": false}, "wednesday": {"start": "09:00", "end": "18:00", "closed": false}, "thursday": {"start": "09:00", "end": "18:00", "closed": false}, "friday": {"start": "09:00", "end": "18:00", "closed": false}, "saturday": {"start": "09:00", "end": "18:00", "closed": false}, "sunday": {"start": "09:00", "end": "18:00", "closed": true}}';

-- Add columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create new tables
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('garage', 'customer')),
  sender_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garages' AND policyname = 'Garage owners can view their garages') THEN
        CREATE POLICY "Garage owners can view their garages" ON garages FOR SELECT USING (auth.uid() = owner_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'garages' AND policyname = 'Garage owners can update their garages') THEN
        CREATE POLICY "Garage owners can update their garages" ON garages FOR UPDATE USING (auth.uid() = owner_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Garage owners can view their bookings') THEN
        CREATE POLICY "Garage owners can view their bookings" ON bookings FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM garages WHERE id = garage_id));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Garage owners can update their bookings') THEN
        CREATE POLICY "Garage owners can update their bookings" ON bookings FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM garages WHERE id = garage_id));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Users can create bookings') THEN
        CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Enable RLS and create policies for new tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their bookings" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() IN (SELECT owner_id FROM garages g JOIN bookings b ON g.id = b.garage_id WHERE b.id = booking_id)
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Garage owners can view their earnings" ON earnings
  FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM garages WHERE id = garage_id));

-- Enable realtime
ALTER TABLE garages REPLICA IDENTITY FULL;
ALTER TABLE services REPLICA IDENTITY FULL;
ALTER TABLE bookings REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE earnings REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE garages;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE earnings;
