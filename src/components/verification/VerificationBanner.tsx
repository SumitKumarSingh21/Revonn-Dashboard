import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Upload, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationBannerProps {
  verificationStatus: 'pending' | 'provisional' | 'verified' | 'certified' | 'rejected';
  badgeColor: string;
  hasDocuments: boolean;
  hasBankDetails: boolean;
  bankStatus?: 'pending' | 'verified' | 'rejected';
  onNavigateToVerification?: () => void;
}

export function VerificationBanner({
  verificationStatus,
  badgeColor,
  hasDocuments,
  hasBankDetails,
  bankStatus,
  onNavigateToVerification
}: VerificationBannerProps) {
  const navigate = useNavigate();

  const getVerificationBadge = () => {
    const badgeClass = badgeColor === 'green' ? 'bg-green-500' : badgeColor === 'yellow' ? 'bg-yellow-500' : 'bg-gray-500';
    
    switch (verificationStatus) {
      case 'certified':
        return <Badge className={`${badgeClass} text-white`}>Revonn Certified</Badge>;
      case 'verified':
        return <Badge className={`${badgeClass} text-white`}>Verified</Badge>;
      case 'provisional':
        return <Badge className={`${badgeClass} text-white`}>Provisional Verified</Badge>;
      default:
        return <Badge variant="secondary">Unverified</Badge>;
    }
  };

  const getBankStatusBadge = () => {
    if (!bankStatus) return null;
    
    switch (bankStatus) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Bank Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Bank Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Bank Pending</Badge>;
    }
  };

  // Dashboard banner for incomplete verification
  if (!hasDocuments) {
    return (
      <Alert className="mb-6 border-orange-500/20 bg-orange-500/10">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Complete Your Verification</strong>
            <p className="text-sm mt-1">Upload documents to verify your garage and start earning.</p>
          </div>
          <Button 
            onClick={() => onNavigateToVerification ? onNavigateToVerification() : navigate('/dashboard?tab=verification')}
            variant="outline"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Documents
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Earnings page banner for bank verification
  if (hasDocuments && !hasBankDetails) {
    return (
      <Alert className="mb-6 border-blue-500/20 bg-blue-500/10">
        <CreditCard className="h-4 w-4 text-blue-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Add Bank Details</strong>
            <p className="text-sm mt-1">Add bank account details to enable payouts.</p>
          </div>
          <Button 
            onClick={() => onNavigateToVerification ? onNavigateToVerification() : navigate('/dashboard?tab=earnings')}
            variant="outline"
            size="sm"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Bank Details
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Bank verification status banners
  if (hasBankDetails && bankStatus === 'pending') {
    return (
      <Alert className="mb-6 border-yellow-500/20 bg-yellow-500/10">
        <Clock className="h-4 w-4 text-yellow-500" />
        <AlertDescription>
          <strong>Bank Verification in Progress</strong>
          <p className="text-sm mt-1">Your bank details are being verified. This usually takes 1-2 business days.</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (hasBankDetails && bankStatus === 'rejected') {
    return (
      <Alert className="mb-6 border-red-500/20 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>Bank Verification Failed</strong>
            <p className="text-sm mt-1">Please re-upload your bank details with correct information.</p>
          </div>
          <Button 
            onClick={() => onNavigateToVerification ? onNavigateToVerification() : navigate('/dashboard?tab=earnings')}
            variant="outline"
            size="sm"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Update Bank Details
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Verification status display (non-banner)
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Verification Status:</span>
        {getVerificationBadge()}
      </div>
      {getBankStatusBadge() && (
        <div className="flex items-center gap-2">
          {getBankStatusBadge()}
        </div>
      )}
    </div>
  );
}