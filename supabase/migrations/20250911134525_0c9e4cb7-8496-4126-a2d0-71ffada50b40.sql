-- Replace function that caused error due to missing net schema
CREATE OR REPLACE FUNCTION public.notify_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT := 'booking';
BEGIN
  -- Notify on status change
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    notification_title := 'Booking Status Update';
    CASE NEW.status
      WHEN 'confirmed' THEN
        notification_body := 'Your booking has been confirmed!';
      WHEN 'in_progress' THEN
        notification_body := 'Your service is now in progress.';
      WHEN 'completed' THEN
        notification_body := 'Your service has been completed!';
      WHEN 'cancelled' THEN
        notification_body := 'Your booking has been cancelled.';
      ELSE
        notification_body := 'Your booking status has been updated to ' || NEW.status;
    END CASE;

    -- Create notification record only (no external HTTP call)
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
  END IF;

  -- Notify when mechanic is newly assigned
  IF NEW.assigned_mechanic_id IS NOT NULL AND OLD.assigned_mechanic_id IS NULL THEN
    notification_title := 'Mechanic Assigned';
    notification_body := 'A mechanic has been assigned to your booking: ' || COALESCE(NEW.assigned_mechanic_name, 'Mechanic');

    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object('booking_id', NEW.id, 'mechanic_id', NEW.assigned_mechanic_id)
    );
  END IF;

  RETURN NEW;
END;
$function$;