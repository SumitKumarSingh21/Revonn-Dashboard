-- Add bank account details fields to garages table
ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS bank_ifsc_code TEXT;
ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS bank_account_holder_name TEXT;
ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS bank_upi_id TEXT;
ALTER TABLE public.garages ADD COLUMN IF NOT EXISTS bank_details_verified BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.garages.bank_account_number IS 'Bank account number for payment settlements';
COMMENT ON COLUMN public.garages.bank_ifsc_code IS 'IFSC code for bank transfers';
COMMENT ON COLUMN public.garages.bank_account_holder_name IS 'Name of the account holder';
COMMENT ON COLUMN public.garages.bank_upi_id IS 'UPI ID for digital payments';
COMMENT ON COLUMN public.garages.bank_details_verified IS 'Whether bank details have been verified';