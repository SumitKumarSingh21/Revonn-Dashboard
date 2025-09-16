import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Ticket, Clock, CheckCircle, XCircle } from "lucide-react";
import SupportChat from "./support/SupportChat";
import TicketForm from "./support/TicketForm";
import CallRequestForm from "./support/CallRequestForm";
import TicketsList from "./support/TicketsList";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface CallRequest {
  id: string;
  reason: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

const SupportTab = () => {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
      } else {
        setTickets(ticketsData || []);
      }

      // Fetch call requests
      const { data: callsData, error: callsError } = await supabase
        .from('call_requests')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (callsError) {
        console.error('Error fetching call requests:', callsError);
      } else {
        setCallRequests(callsData || []);
      }
    } catch (error) {
      console.error('Error fetching support data:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleTicketCreated = () => {
    fetchSupportData();
    toast.success(t('ticketCreated'));
  };

  const handleCallRequested = () => {
    fetchSupportData();
    toast.success(t('callRequested'));
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800", 
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };

    const statusIcons = {
      pending: Clock,
      in_progress: MessageCircle,
      resolved: CheckCircle,
      rejected: XCircle
    };

    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
    const colorClass = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${colorClass} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {t(status)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('customerCare')}</h1>
        <p className="text-gray-600">{t('supportCenter')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageCircle className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{tickets.length}</p>
              <p className="text-sm text-gray-600">{t('ticketList')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Phone className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">{callRequests.length}</p>
              <p className="text-sm text-gray-600">{t('requestCallBack')}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Ticket className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
              <p className="text-sm text-gray-600">{t('resolved')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('chatWithSupport')}
          </TabsTrigger>
          <TabsTrigger value="ticket" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            {t('raiseTicket')}
          </TabsTrigger>
          <TabsTrigger value="callback" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('requestCallBack')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('ticketStatus')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('chatWithSupport')}</CardTitle>
              <CardDescription>
                Get instant help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticket" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('raiseTicket')}</CardTitle>
              <CardDescription>
                Submit a detailed issue for our support team to resolve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TicketForm onTicketCreated={handleTicketCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="callback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('requestCallBack')}</CardTitle>
              <CardDescription>
                Request a call from our support team at your preferred time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallRequestForm onCallRequested={handleCallRequested} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <TicketsList 
            tickets={tickets}
            callRequests={callRequests}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportTab;