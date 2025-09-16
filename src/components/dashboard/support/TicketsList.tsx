import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Ticket, Phone, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

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

interface TicketsListProps {
  tickets: SupportTicket[];
  callRequests: CallRequest[];
  getStatusBadge: (status: string) => React.ReactNode;
}

const TicketsList = ({ tickets, callRequests, getStatusBadge }: TicketsListProps) => {
  const { t } = useLanguage();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  return (
    <div className="space-y-6">
      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {t('ticketList')}
          </CardTitle>
          <CardDescription>
            Track the status of your support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('noTickets')}</p>
              <p className="text-sm text-gray-400">
                Your support tickets will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.category.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(ticket.created_at)}
                    </div>
                    {ticket.updated_at !== ticket.created_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {formatDate(ticket.updated_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Call Requests
          </CardTitle>
          <CardDescription>
            Your requested call backs from support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {callRequests.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No call requests yet</p>
              <p className="text-sm text-gray-400">
                Your call back requests will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {callRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {request.reason.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Preferred time: {formatDate(request.preferred_time)}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Requested {formatDate(request.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsList;