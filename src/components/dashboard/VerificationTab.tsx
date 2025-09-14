import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CreditCard, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUpload } from '@/components/verification/DocumentUpload';
import { BankVerification } from '@/components/verification/BankVerification';
import { VerificationBanner } from '@/components/verification/VerificationBanner';
import { toast } from 'sonner';

interface VerificationTabProps {
  user: any;
}

export function VerificationTab({ user }: VerificationTabProps) {
  const [garage, setGarage] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [bankVerification, setBankVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user]);

  const loadVerificationData = async () => {
    try {
      // Load garage data
      const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (garageError) throw garageError;
      setGarage(garageData);

      // Load documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('garage_documents')
        .select('*')
        .eq('garage_id', garageData.id);

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

      // Load bank verification
      const { data: bankData, error: bankError } = await supabase
        .from('bank_verification')
        .select('*')
        .eq('garage_id', garageData.id)
        .single();

      if (bankError && bankError.code !== 'PGRST116') throw bankError;
      setBankVerification(bankData);

    } catch (error) {
      console.error('Error loading verification data:', error);
      toast.error('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleDataUpdate = () => {
    loadVerificationData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading verification data...</p>
        </div>
      </div>
    );
  }

  if (!garage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification</CardTitle>
          <CardDescription>Complete your garage profile first to access verification.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasRequiredDocuments = documents.some(d => d.document_type === 'identity_proof' && d.verified) &&
                                documents.some(d => d.document_type === 'garage_photo' && d.verified);

  const getVerificationLevel = () => {
    const hasIdentity = documents.some(d => d.document_type === 'identity_proof' && d.verified);
    const hasGaragePhoto = documents.some(d => d.document_type === 'garage_photo' && d.verified);
    const hasAddress = documents.some(d => d.document_type === 'address_proof' && d.verified);
    const hasBusiness = documents.some(d => d.document_type === 'business_proof' && d.verified);
    const bankVerified = bankVerification?.status === 'verified';

    if (hasIdentity && hasGaragePhoto) {
      if (hasAddress && hasBusiness && bankVerified) {
        return { level: 'Revonn Certified', color: 'bg-green-500', benefits: 'Top visibility, full payouts active' };
      } else if (hasAddress) {
        return { level: 'Verified', color: 'bg-yellow-500', benefits: 'Normal visibility, payouts with bank verification' };
      } else {
        return { level: 'Provisional Verified', color: 'bg-gray-500', benefits: 'Limited visibility, no payouts' };
      }
    }
    return { level: 'Unverified', color: 'bg-red-500', benefits: 'Minimum visibility, no payouts' };
  };

  const verificationLevel = getVerificationLevel();

  return (
    <div className="space-y-6">
      <VerificationBanner
        verificationStatus={garage.verification_status}
        badgeColor={garage.verification_badge_color}
        hasDocuments={hasRequiredDocuments}
        hasBankDetails={!!bankVerification}
        bankStatus={bankVerification?.status}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Verification Status</CardTitle>
            </div>
            <Badge className={`${verificationLevel.color} text-white`}>
              {verificationLevel.level}
            </Badge>
          </div>
          <CardDescription>
            {verificationLevel.benefits}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Documents</p>
              <p className="text-sm text-muted-foreground">
                {documents.filter(d => d.verified).length} verified
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Bank Account</p>
              <p className="text-sm text-muted-foreground">
                {bankVerification?.status || 'Not added'}
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Trust Level</p>
              <p className="text-sm text-muted-foreground">
                {verificationLevel.level}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
          <TabsTrigger value="bank">Bank Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <DocumentUpload
            garageId={garage.id}
            onUploadComplete={handleDataUpdate}
          />
        </TabsContent>

        <TabsContent value="bank">
          <BankVerification
            garageId={garage.id}
            onVerificationComplete={handleDataUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}