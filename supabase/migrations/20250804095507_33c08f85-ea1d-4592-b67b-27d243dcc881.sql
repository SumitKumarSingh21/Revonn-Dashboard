
-- First, let's make sure notifications can be inserted by the system
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;

-- Create proper RLS policies for notifications
CREATE POLICY "Users can view their notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete their notifications" 
  ON public.notifications 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Create a trigger function to create booking notifications
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER AS $$
DECLARE
  garage_owner_id UUID;
  garage_name TEXT;
BEGIN
  -- Get garage owner details
  SELECT owner_id, name INTO garage_owner_id, garage_name
  FROM public.garages 
  WHERE id = NEW.garage_id;
  
  -- Create notification for garage owner
  IF garage_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      garage_owner_id,
      'booking',
      'New Booking Alert!',
      'You have received a new booking for ' || COALESCE(NEW.service_names, 'your services'),
      jsonb_build_object(
        'booking_id', NEW.id,
        'garage_id', NEW.garage_id,
        'customer_name', NEW.customer_name,
        'booking_date', NEW.booking_date,
        'booking_time', NEW.booking_time
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS trigger_create_booking_notification ON public.bookings;
CREATE TRIGGER trigger_create_booking_notification
  AFTER INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_booking_notification();

-- Create a function to create review notifications
CREATE OR REPLACE FUNCTION public.create_review_notification()
RETURNS TRIGGER AS $$
DECLARE
  garage_owner_id UUID;
BEGIN
  -- Get garage owner
  SELECT owner_id INTO garage_owner_id
  FROM public.garages 
  WHERE id = NEW.garage_id;
  
  -- Create notification for garage owner
  IF garage_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      garage_owner_id,
      'review',
      'New Review Received!',
      'You received a ' || NEW.rating || '-star review',
      jsonb_build_object(
        'review_id', NEW.id,
        'garage_id', NEW.garage_id,
        'rating', NEW.rating
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new reviews
DROP TRIGGER IF EXISTS trigger_create_review_notification ON public.reviews;
CREATE TRIGGER trigger_create_review_notification
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.create_review_notification();

-- Create a function to create payment notifications
CREATE OR REPLACE FUNCTION public.create_payment_notification()
RETURNS TRIGGER AS $$
DECLARE
  garage_owner_id UUID;
BEGIN
  -- Get garage owner
  SELECT owner_id INTO garage_owner_id
  FROM public.garages 
  WHERE id = NEW.garage_id;
  
  -- Create notification for garage owner
  IF garage_owner_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      garage_owner_id,
      'payment',
      'Payment Received!',
      'New payment of ₹' || NEW.amount || ' received',
      jsonb_build_object(
        'earning_id', NEW.id,
        'garage_id', NEW.garage_id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new earnings/payments
DROP TRIGGER IF EXISTS trigger_create_payment_notification ON public.earnings;
CREATE TRIGGER trigger_create_payment_notification
  AFTER INSERT ON public.earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payment_notification();
