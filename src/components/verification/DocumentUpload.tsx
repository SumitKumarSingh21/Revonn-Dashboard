import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentUploadProps {
  garageId: string;
  onUploadComplete: () => void;
}

interface DocumentInfo {
  type: 'identity_proof' | 'garage_photo' | 'address_proof' | 'business_proof';
  label: string;
  description: string;
  required: boolean;
  accepted: string;
}

const documentTypes: DocumentInfo[] = [
  {
    type: 'identity_proof',
    label: 'Owner Identity Proof',
    description: 'Aadhaar Card or PAN Card (both sides if applicable)',
    required: true,
    accepted: '.jpg,.jpeg,.png,.pdf'
  },
  {
    type: 'garage_photo',
    label: 'Garage Photo with Signboard',
    description: 'Clear photo showing your garage name and premises',
    required: true,
    accepted: '.jpg,.jpeg,.png'
  },
  {
    type: 'address_proof',
    label: 'Address Proof',
    description: 'Electricity bill, rent agreement, or property documents',
    required: false,
    accepted: '.jpg,.jpeg,.png,.pdf'
  },
  {
    type: 'business_proof',
    label: 'Business Proof',
    description: 'GST certificate, trade license, or business registration',
    required: false,
    accepted: '.jpg,.jpeg,.png,.pdf'
  }
];

export function DocumentUpload({ garageId, onUploadComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadDocuments();
  }, [garageId]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('garage_documents')
        .select('*')
        .eq('garage_id', garageId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file: File, documentType: string) => {
    try {
      setUploading(documentType);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('garage-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('garage-documents')
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from('garage_documents')
        .insert({
          garage_id: garageId,
          document_type: documentType as any,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size
        });

      if (insertError) throw insertError;

      toast.success('Document uploaded successfully');
      loadDocuments();
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents.find(d => d.document_type === type);
    if (!doc) return null;
    
    if (doc.verified) return 'verified';
    if (doc.rejection_reason) return 'rejected';
    return 'pending';
  };

  const getStatusBadge = (status: string | null, required: boolean) => {
    if (!status) {
      return required ? (
        <Badge variant="destructive">Required</Badge>
      ) : (
        <Badge variant="secondary">Optional</Badge>
      );
    }

    switch (status) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Verification
          </CardTitle>
          <CardDescription>
            Upload required documents to verify your garage. Required documents are needed for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.type);
              const doc = documents.find(d => d.document_type === docType.type);
              
              return (
                <div key={docType.type} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">{docType.label}</Label>
                      <p className="text-sm text-muted-foreground mt-1">{docType.description}</p>
                    </div>
                    {getStatusBadge(status, docType.required)}
                  </div>

                  {doc?.rejection_reason && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      <p className="text-sm text-destructive">
                        <strong>Rejection Reason:</strong> {doc.rejection_reason}
                      </p>
                    </div>
                  )}

                  {!status || status === 'rejected' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept={docType.accepted}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadDocument(file, docType.type);
                          }
                        }}
                        disabled={uploading === docType.type}
                        className="flex-1"
                      />
                      {uploading === docType.type && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Upload className="w-4 h-4 animate-spin" />
                          Uploading...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Document uploaded: {doc?.file_name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Verification Levels</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><strong>Provisional:</strong> Identity + Garage Photo (limited visibility)</p>
              <p><strong>Verified:</strong> + Address Proof (normal visibility)</p>
              <p><strong>Revonn Certified:</strong> + Business + Bank Details (top visibility & payouts)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}