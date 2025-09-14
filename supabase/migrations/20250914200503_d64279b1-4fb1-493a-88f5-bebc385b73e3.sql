-- Create enum for verification status
CREATE TYPE verification_status AS ENUM ('pending', 'provisional', 'verified', 'certified', 'rejected');

-- Create enum for document types
CREATE TYPE document_type AS ENUM ('identity_proof', 'garage_photo', 'address_proof', 'business_proof', 'bank_proof');

-- Create enum for bank verification status
CREATE TYPE bank_verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Update garages table to include verification status
ALTER TABLE garages 
ADD COLUMN verification_status verification_status DEFAULT 'pending',
ADD COLUMN verification_badge_color text DEFAULT 'grey',
ADD COLUMN documents_uploaded_at timestamp with time zone,
ADD COLUMN bank_verified_at timestamp with time zone;

-- Create garage_documents table
CREATE TABLE garage_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    garage_id uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    file_url text NOT NULL,
    file_name text NOT NULL,
    file_size integer,
    uploaded_at timestamp with time zone DEFAULT now(),
    verified boolean DEFAULT false,
    verified_at timestamp with time zone,
    verified_by uuid,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create bank_verification table
CREATE TABLE bank_verification (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    garage_id uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    bank_name text NOT NULL,
    account_holder_name text NOT NULL,
    account_type text NOT NULL CHECK (account_type IN ('savings', 'current')),
    account_number text NOT NULL,
    ifsc_code text NOT NULL,
    upi_id text,
    bank_proof_url text,
    status bank_verification_status DEFAULT 'pending',
    verified_at timestamp with time zone,
    verified_by uuid,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(garage_id)
);

-- Create verification_audit_log table
CREATE TABLE verification_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    garage_id uuid NOT NULL REFERENCES garages(id) ON DELETE CASCADE,
    admin_id uuid NOT NULL,
    action text NOT NULL,
    entity_type text NOT NULL, -- 'document' or 'bank'
    entity_id uuid,
    old_status text,
    new_status text,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE garage_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for garage_documents
CREATE POLICY "Garage owners can view their documents" ON garage_documents
FOR SELECT USING (garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid()));

CREATE POLICY "Garage owners can insert their documents" ON garage_documents
FOR INSERT WITH CHECK (garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid()));

CREATE POLICY "Garage owners can update their documents" ON garage_documents
FOR UPDATE USING (garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid()));

CREATE POLICY "Admins can view all documents" ON garage_documents
FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can update documents" ON garage_documents
FOR UPDATE USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

-- RLS policies for bank_verification
CREATE POLICY "Garage owners can manage their bank details" ON bank_verification
FOR ALL USING (garage_id IN (SELECT id FROM garages WHERE owner_id = auth.uid()));

CREATE POLICY "Admins can view all bank verifications" ON bank_verification
FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can update bank verifications" ON bank_verification
FOR UPDATE USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

-- RLS policies for verification_audit_log
CREATE POLICY "Admins can view audit logs" ON verification_audit_log
FOR SELECT USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

CREATE POLICY "Admins can insert audit logs" ON verification_audit_log
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true));

-- Create function to update garage verification status
CREATE OR REPLACE FUNCTION update_garage_verification_status()
RETURNS TRIGGER AS $$
DECLARE
    doc_count INTEGER;
    required_docs INTEGER := 2; -- identity_proof and garage_photo
    has_identity BOOLEAN;
    has_garage_photo BOOLEAN;
    has_address BOOLEAN;
    has_business BOOLEAN;
    bank_verified BOOLEAN;
    new_status verification_status;
    badge_color text;
BEGIN
    -- Count verified documents
    SELECT COUNT(*) INTO doc_count
    FROM garage_documents 
    WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id) AND verified = true;
    
    -- Check specific document types
    SELECT 
        bool_or(document_type = 'identity_proof' AND verified = true),
        bool_or(document_type = 'garage_photo' AND verified = true),
        bool_or(document_type = 'address_proof' AND verified = true),
        bool_or(document_type = 'business_proof' AND verified = true)
    INTO has_identity, has_garage_photo, has_address, has_business
    FROM garage_documents 
    WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id);
    
    -- Check bank verification status
    SELECT status = 'verified' INTO bank_verified
    FROM bank_verification 
    WHERE garage_id = COALESCE(NEW.garage_id, OLD.garage_id);
    
    -- Determine verification status
    IF has_identity AND has_garage_photo THEN
        IF has_address AND has_business AND bank_verified THEN
            new_status := 'certified';
            badge_color := 'green';
        ELSIF has_address THEN
            new_status := 'verified';
            badge_color := 'yellow';
        ELSE
            new_status := 'provisional';
            badge_color := 'grey';
        END IF;
    ELSE
        new_status := 'pending';
        badge_color := 'grey';
    END IF;
    
    -- Update garage status
    UPDATE garages 
    SET 
        verification_status = new_status,
        verification_badge_color = badge_color,
        documents_uploaded_at = CASE WHEN has_identity AND has_garage_photo THEN now() ELSE documents_uploaded_at END,
        bank_verified_at = CASE WHEN bank_verified THEN now() ELSE bank_verified_at END
    WHERE id = COALESCE(NEW.garage_id, OLD.garage_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_garage_verification_on_document_change
    AFTER INSERT OR UPDATE ON garage_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_garage_verification_status();

CREATE TRIGGER update_garage_verification_on_bank_change
    AFTER INSERT OR UPDATE ON bank_verification
    FOR EACH ROW
    EXECUTE FUNCTION update_garage_verification_status();

-- Create storage buckets for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('garage-documents', 'garage-documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('bank-proofs', 'bank-proofs', false);

-- Storage policies for garage-documents bucket
CREATE POLICY "Garage owners can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'garage-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Garage owners can view their documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'garage-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all garage documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'garage-documents' AND 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Storage policies for bank-proofs bucket
CREATE POLICY "Garage owners can upload bank proofs" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'bank-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Garage owners can view their bank proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'bank-proofs' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all bank proofs" ON storage.objects
FOR SELECT USING (
    bucket_id = 'bank-proofs' AND 
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
);

-- Function to get Indian banks list
CREATE OR REPLACE FUNCTION get_indian_banks()
RETURNS TABLE(bank_name text) AS $$
BEGIN
    RETURN QUERY VALUES 
        ('State Bank of India'),
        ('HDFC Bank'),
        ('ICICI Bank'),
        ('Punjab National Bank'),
        ('Bank of Baroda'),
        ('Canara Bank'),
        ('Union Bank of India'),
        ('Bank of India'),
        ('Indian Bank'),
        ('Central Bank of India'),
        ('Indian Overseas Bank'),
        ('UCO Bank'),
        ('Bank of Maharashtra'),
        ('Punjab & Sind Bank'),
        ('Axis Bank'),
        ('Kotak Mahindra Bank'),
        ('IndusInd Bank'),
        ('Yes Bank'),
        ('IDFC First Bank'),
        ('Federal Bank'),
        ('South Indian Bank'),
        ('Karur Vysya Bank'),
        ('Tamilnad Mercantile Bank'),
        ('City Union Bank'),
        ('Dhanlaxmi Bank'),
        ('RBL Bank'),
        ('Bandhan Bank'),
        ('ESAF Small Finance Bank'),
        ('Jana Small Finance Bank'),
        ('Paytm Payments Bank'),
        ('Airtel Payments Bank');
END;
$$ LANGUAGE plpgsql;