-- Security Fix: Ensure bookings table is completely secure
-- Remove any potential anonymous access and strengthen RLS policies

-- First, drop existing policies to recreate them with stricter security
DROP POLICY IF EXISTS "Garage owners can update their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Garage owners can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Recreate policies with explicit authentication requirements and stricter access control

-- Policy 1: Users can only create bookings when authenticated and for themselves
CREATE POLICY "Authenticated users can create their own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Policy 2: Users can only view their own bookings when authenticated  
CREATE POLICY "Authenticated users can view their own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy 3: Garage owners can view bookings for their garages when authenticated
CREATE POLICY "Authenticated garage owners can view their garage bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = bookings.garage_id 
    AND garages.owner_id = auth.uid()
  )
);

-- Policy 4: Garage owners can update bookings for their garages when authenticated
CREATE POLICY "Authenticated garage owners can update their garage bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.garages 
    WHERE garages.id = bookings.garage_id 
    AND garages.owner_id = auth.uid()
  )
);

-- Ensure RLS is enabled (should already be enabled but double-checking)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Add comment for security documentation
COMMENT ON TABLE public.bookings IS 'Contains sensitive customer booking data - access restricted to authenticated users only via RLS policies';