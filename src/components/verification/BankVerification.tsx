import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, CheckCircle, XCircle, Clock, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BankVerificationProps {
  garageId: string;
  onVerificationComplete: () => void;
}

interface BankData {
  bank_name: string;
  account_holder_name: string;
  account_type: string;
  account_number: string;
  account_number_confirm: string;
  ifsc_code: string;
  upi_id: string;
}

const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Yes Bank',
  'IDFC First Bank',
  'Federal Bank',
  'RBL Bank',
  'Bandhan Bank'
];

export function BankVerification({ garageId, onVerificationComplete }: BankVerificationProps) {
  const [formData, setFormData] = useState<BankData>({
    bank_name: '',
    account_holder_name: '',
    account_type: '',
    account_number: '',
    account_number_confirm: '',
    ifsc_code: '',
    upi_id: ''
  });
  const [bankProofFile, setBankProofFile] = useState<File | null>(null);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBankVerification();
  }, [garageId]);

  const loadBankVerification = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_verification')
        .select('*')
        .eq('garage_id', garageId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setExistingVerification(data);
        setFormData({
          bank_name: data.bank_name,
          account_holder_name: data.account_holder_name,
          account_type: data.account_type,
          account_number: data.account_number,
          account_number_confirm: data.account_number,
          ifsc_code: data.ifsc_code,
          upi_id: data.upi_id || ''
        });
      }
    } catch (error) {
      console.error('Error loading bank verification:', error);
      toast.error('Failed to load bank verification data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.bank_name || !formData.account_holder_name || !formData.account_type || 
        !formData.account_number || !formData.ifsc_code) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.account_number !== formData.account_number_confirm) {
      toast.error('Account numbers do not match');
      return false;
    }

    // IFSC code validation
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(formData.ifsc_code)) {
      toast.error('Please enter a valid IFSC code');
      return false;
    }

    if (!bankProofFile && !existingVerification?.bank_proof_url) {
      toast.error('Please upload bank proof document');
      return false;
    }

    return true;
  };

  const uploadBankProof = async (file: File): Promise<string> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user.id}/bank_proof_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bank-proofs')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('bank-proofs')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);

      let bankProofUrl = existingVerification?.bank_proof_url;
      
      if (bankProofFile) {
        bankProofUrl = await uploadBankProof(bankProofFile);
      }

      const bankData = {
        garage_id: garageId,
        bank_name: formData.bank_name,
        account_holder_name: formData.account_holder_name,
        account_type: formData.account_type,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code.toUpperCase(),
        upi_id: formData.upi_id || null,
        bank_proof_url: bankProofUrl,
        status: 'pending' as const
      };

      const { error } = existingVerification
        ? await supabase
            .from('bank_verification')
            .update(bankData)
            .eq('garage_id', garageId)
        : await supabase
            .from('bank_verification')
            .insert(bankData);

      if (error) throw error;

      toast.success('Bank details submitted for verification');
      onVerificationComplete();
      loadBankVerification();
    } catch (error) {
      console.error('Error saving bank verification:', error);
      toast.error('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = () => {
    if (!existingVerification) return null;

    switch (existingVerification.status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const canEdit = !existingVerification || existingVerification.status === 'rejected';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            <CardTitle>Bank Account Verification</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        {existingVerification?.rejection_reason && (
          <Alert className="mb-6 border-destructive/20 bg-destructive/10">
            <XCircle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <strong>Rejection Reason:</strong> {existingVerification.rejection_reason}
            </AlertDescription>
          </Alert>
        )}

        {existingVerification?.status === 'verified' && (
          <Alert className="mb-6 border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              Your bank account has been verified and payouts are active.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Select
                value={formData.bank_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank_name: value }))}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account_type">Account Type *</Label>
              <Select
                value={formData.account_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings Account</SelectItem>
                  <SelectItem value="current">Current Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="account_holder_name">Account Holder Name *</Label>
            <Input
              id="account_holder_name"
              value={formData.account_holder_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_holder_name: e.target.value }))}
              placeholder="As per bank records"
              disabled={!canEdit}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Enter account number"
                disabled={!canEdit}
              />
            </div>

            <div>
              <Label htmlFor="account_number_confirm">Confirm Account Number *</Label>
              <Input
                id="account_number_confirm"
                value={formData.account_number_confirm}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number_confirm: e.target.value }))}
                placeholder="Re-enter account number"
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ifsc_code">IFSC Code *</Label>
              <Input
                id="ifsc_code"
                value={formData.ifsc_code}
                onChange={(e) => setFormData(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                placeholder="e.g., SBIN0001234"
                disabled={!canEdit}
                maxLength={11}
              />
            </div>

            <div>
              <Label htmlFor="upi_id">UPI ID (Optional)</Label>
              <Input
                id="upi_id"
                value={formData.upi_id}
                onChange={(e) => setFormData(prev => ({ ...prev, upi_id: e.target.value }))}
                placeholder="yourname@bank"
                disabled={!canEdit}
              />
            </div>
          </div>

          {canEdit && (
            <div>
              <Label htmlFor="bank_proof">Bank Proof Document *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload cancelled cheque, bank passbook first page, or bank statement (max 5MB)
              </p>
              <Input
                id="bank_proof"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setBankProofFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
            </div>
          )}

          {existingVerification?.bank_proof_url && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Bank proof document uploaded</span>
            </div>
          )}

          {canEdit && (
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Submit Bank Details for Verification'}
            </Button>
          )}
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Important Notes:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Bank verification is required to receive payouts</li>
            <li>• Verification typically takes 1-2 business days</li>
            <li>• Ensure all details match your bank records exactly</li>
            <li>• Upload clear, readable bank proof documents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}