
-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON public.notifications;

-- Allow users to create test notifications for themselves
CREATE POLICY "Users can create their own notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow system/triggers to create notifications for any user
CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Make sure the policies work together by setting them as permissive
ALTER POLICY "Users can create their own notifications" ON public.notifications RENAME TO "Users can create their own notifications (permissive)";
ALTER POLICY "System can create notifications" ON public.notifications RENAME TO "System can create notifications (permissive)";

-- Recreate with proper permissive settings
DROP POLICY "Users can create their own notifications (permissive)" ON public.notifications;
DROP POLICY "System can create notifications (permissive)" ON public.notifications;

CREATE POLICY "Allow notification creation" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id OR  -- Users can create their own notifications
    auth.role() = 'service_role'  -- System can create any notifications
  );
