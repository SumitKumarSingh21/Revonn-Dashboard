
-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone text,
ADD COLUMN location text;
