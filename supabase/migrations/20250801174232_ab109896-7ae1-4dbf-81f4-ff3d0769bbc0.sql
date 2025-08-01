
-- Add foreign key relationships for booking_services table
ALTER TABLE public.booking_services 
ADD CONSTRAINT booking_services_booking_id_fkey 
FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;

ALTER TABLE public.booking_services 
ADD CONSTRAINT booking_services_service_id_fkey 
FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;
