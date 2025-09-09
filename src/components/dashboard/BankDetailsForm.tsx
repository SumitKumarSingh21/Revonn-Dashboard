import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, User, Smartphone } from "lucide-react";

interface BankDetailsFormProps {
  garageId: string;
  onDetailsSubmitted: () => void;
}

const BankDetailsForm = ({ garageId, onDetailsSubmitted }: BankDetailsFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    upiId: "",
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.accountNumber || !formData.ifscCode || !formData.accountHolderName) {
      toast({
        title: "Validation Error",
        description: "Account number, IFSC code, and account holder name are required",
        variant: "destructive",
      });
      return false;
    }

    // Basic IFSC validation (11 characters, first 4 letters, 5th is 0, last 6 are alphanumeric)
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(formData.ifscCode.toUpperCase())) {
      toast({
        title: "Invalid IFSC Code",
        description: "Please enter a valid IFSC code (e.g., SBIN0001234)",
        variant: "destructive",
      });
      return false;
    }

    // Basic account number validation (10-18 digits)
    if (!/^\d{10,18}$/.test(formData.accountNumber)) {
      toast({
        title: "Invalid Account Number",
        description: "Account number should be 10-18 digits",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('garages')
        .update({
          bank_account_number: formData.accountNumber,
          bank_ifsc_code: formData.ifscCode.toUpperCase(),
          bank_account_holder_name: formData.accountHolderName,
          bank_upi_id: formData.upiId || null,
          bank_details_verified: false, // Will need admin verification
        })
        .eq('id', garageId);

      if (error) {
        console.error("Error saving bank details:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Bank details saved successfully! Details will be verified before payments.",
      });

      onDetailsSubmitted();
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        title: "Error",
        description: "Failed to save bank details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Building2 className="h-5 w-5" />
          Complete Bank Account Setup
        </CardTitle>
        <CardDescription className="text-orange-700">
          Add your bank account details to receive payments and settlements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountHolderName" className="text-sm font-medium">
                Account Holder Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="accountHolderName"
                  type="text"
                  placeholder="Enter account holder name"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-sm font-medium">
                Account Number *
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter bank account number"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value.replace(/\D/g, ''))}
                  className="pl-10"
                  maxLength={18}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode" className="text-sm font-medium">
                IFSC Code *
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="ifscCode"
                  type="text"
                  placeholder="e.g., SBIN0001234"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                  className="pl-10"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upiId" className="text-sm font-medium">
                UPI ID (Optional)
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="upiId"
                  type="text"
                  placeholder="e.g., username@paytm"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange("upiId", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Important Information:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Bank details will be verified before processing payments</li>
              <li>• Ensure account holder name matches your official documents</li>
              <li>• Settlements will be processed within 2-3 business days</li>
              <li>• UPI ID is optional but speeds up smaller transactions</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? "Saving Details..." : "Save Bank Details"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsForm;