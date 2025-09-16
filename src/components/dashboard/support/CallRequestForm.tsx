import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface CallRequestFormProps {
  onCallRequested: () => void;
}

const CallRequestForm = ({ onCallRequested }: CallRequestFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    reason: "",
    notes: "",
    customerName: "",
    customerPhone: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30"
  ];

  const reasons = [
    { value: "booking_help", label: "Booking Help" },
    { value: "payment_issue", label: "Payment Issue" },
    { value: "technical_support", label: "Technical Support" },
    { value: "verification_help", label: "Verification Help" },
    { value: "account_issue", label: "Account Issue" },
    { value: "general_inquiry", label: "General Inquiry" },
    { value: "complaint", label: "Complaint" },
    { value: "other", label: "Other" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submitCallRequest = async () => {
    if (!formData.reason || !formData.customerName.trim() || !formData.customerPhone.trim() || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone number
    if (!/^\+?[\d\s-()]{10,}$/.test(formData.customerPhone.trim())) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to request a call");
        return;
      }

      // Combine date and time
      const preferredDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      preferredDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('call_requests')
        .insert({
          customer_name: formData.customerName.trim(),
          customer_phone: formData.customerPhone.trim(),
          customer_email: user.email || '',
          reason: formData.reason,
          preferred_time: preferredDateTime.toISOString(),
          notes: formData.notes.trim() || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating call request:', error);
        toast.error(t('error'));
        return;
      }

      // Reset form
      setFormData({
        reason: "",
        notes: "",
        customerName: "",
        customerPhone: ""
      });
      setSelectedDate(undefined);
      setSelectedTime("");
      
      onCallRequested();
    } catch (error) {
      console.error('Error submitting call request:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Your Name *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Phone Number *</Label>
          <Input
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Call *</Label>
        <Select value={formData.reason} onValueChange={(value) => handleInputChange('reason', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select reason for call" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((reason) => (
              <SelectItem key={reason.value} value={reason.value}>
                {reason.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('preferredTime')} - Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>{t('preferredTime')} - Time *</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {selectedTime || "Select time"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes ({t('optional')})</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional information you'd like to share..."
          rows={3}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Our support team will review your request within 2 hours</li>
          <li>• You'll receive a confirmation call at your preferred time</li>
          <li>• If unavailable, we'll reschedule at your convenience</li>
          <li>• Average call duration: 10-15 minutes</li>
        </ul>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              reason: "",
              notes: "",
              customerName: "",
              customerPhone: ""
            });
            setSelectedDate(undefined);
            setSelectedTime("");
          }}
        >
          {t('cancel')}
        </Button>
        <Button onClick={submitCallRequest} disabled={loading}>
          {loading ? t('loading') : t('requestCallBack')}
        </Button>
      </div>
    </div>
  );
};

export default CallRequestForm;