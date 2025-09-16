import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface TicketFormProps {
  onTicketCreated: () => void;
}

const TicketForm = ({ onTicketCreated }: TicketFormProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: "booking_issues", label: t('bookingIssues') },
    { value: "payment_delays", label: t('paymentDelays') },
    { value: "app_bugs", label: t('appBugs') },
    { value: "verification", label: t('verification') },
    { value: "account_issues", label: t('accountIssues') },
    { value: "general", label: t('general') },
    { value: "other", label: t('other') }
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setAttachedFile(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const submitTicket = async () => {
    if (!formData.subject.trim() || !formData.category || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to submit a ticket");
        return;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      let attachmentUrl = null;

      // Upload file if attached
      if (attachedFile) {
        const fileExt = attachedFile.name.split('.').pop();
        const fileName = `ticket-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('garage-documents')
          .upload(`support-attachments/${fileName}`, attachedFile);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(t('failedUpload'));
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('garage-documents')
          .getPublicUrl(uploadData.path);
        
        attachmentUrl = publicUrl;
      }

      // Create support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          customer_name: profile?.full_name || user.user_metadata?.full_name || 'User',
          customer_email: user.email || '',
          customer_phone: profile?.phone || '',
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          category: formData.category,
          priority: formData.priority,
          status: 'open',
          notes: attachmentUrl ? `Attachment: ${attachmentUrl}` : null
        });

      if (error) {
        console.error('Error creating ticket:', error);
        toast.error(t('error'));
        return;
      }

      // Reset form
      setFormData({
        subject: "",
        category: "",
        priority: "medium",
        description: ""
      });
      setAttachedFile(null);
      
      onTicketCreated();
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">{t('subject')} *</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder="Brief description of your issue"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">{t('issueCategory')} *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('issueDescription')} *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder={t('describeIssue')}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('attachFile')} ({t('optional')})</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {attachedFile ? (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">{attachedFile.name}</span>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Upload screenshots or documents (optional)
              </p>
              <Input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" type="button">
                  Choose File
                </Button>
              </Label>
              <p className="text-xs text-gray-500 mt-2">
                Max file size: 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFormData({
              subject: "",
              category: "",
              priority: "medium",
              description: ""
            });
            setAttachedFile(null);
          }}
        >
          {t('cancel')}
        </Button>
        <Button onClick={submitTicket} disabled={loading}>
          {loading ? t('loading') : t('submit')}
        </Button>
      </div>
    </div>
  );
};

export default TicketForm;