
-- Create a trigger function that will be called when bookings are inserted or updated
CREATE OR REPLACE FUNCTION handle_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function to create notification
  PERFORM
    net.http_post(
      url := 'https://tblogmnlaeeamnanksys.supabase.co/functions/v1/create-booking-notification',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE null END
      )::jsonb
    );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for INSERT and UPDATE on bookings table
DROP TRIGGER IF EXISTS booking_notification_trigger_insert ON public.bookings;
DROP TRIGGER IF EXISTS booking_notification_trigger_update ON public.bookings;

CREATE TRIGGER booking_notification_trigger_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_notification();

CREATE TRIGGER booking_notification_trigger_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_booking_notification();
