-- Drop the problematic trigger that uses net schema which doesn't exist
DROP TRIGGER IF EXISTS booking_notification_trigger_insert ON public.bookings;
DROP TRIGGER IF EXISTS booking_notification_trigger_update ON public.bookings;
DROP FUNCTION IF EXISTS handle_booking_notification();

-- The notify_booking_update() function already handles notifications properly
-- so we don't need the net.http_post trigger