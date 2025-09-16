import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, HeadphonesIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender_type: 'user' | 'agent';
  message: string;
  created_at: string;
  sender_id?: string;
}

const SupportChat = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [currentTicket, setCurrentTicket] = useState<string | null>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create or get existing support ticket for chat
      const { data: existingTicket } = await supabase
        .from('support_tickets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', 'chat')
        .eq('status', 'open')
        .single();

      let ticketId = existingTicket?.id;

      if (!ticketId) {
        const { data: newTicket, error } = await supabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            customer_name: user.user_metadata?.full_name || 'User',
            customer_email: user.email || '',
            subject: 'Live Chat Support',
            description: 'Live chat conversation',
            category: 'chat',
            priority: 'medium',
            status: 'open'
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating chat ticket:', error);
          toast.error(t('error'));
          return;
        }
        ticketId = newTicket.id;
      }

      setCurrentTicket(ticketId);
      await loadChatHistory(ticketId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error(t('error'));
    }
  };

  const loadChatHistory = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      setMessages((data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'user' | 'agent'
      })));
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTicket || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          ticket_id: currentTicket,
          sender_id: user.id,
          sender_type: 'user',
          message: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error(t('failedUpdate'));
        return;
      }

      // Add message to local state immediately
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender_type: 'user',
        message: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender_id: user.id
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");

      // Reload messages to get the actual saved message
      await loadChatHistory(currentTicket);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-96 flex flex-col">
      {/* Chat Status */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isConnected ? t('connected') : t('disconnected')}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {t('supportCenter')}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <HeadphonesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('chatWithSupport')}</p>
              <p className="text-sm text-gray-400">
                Start a conversation with our support team
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_type === 'agent' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <HeadphonesIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>

                {message.sender_type === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage')}
            disabled={!isConnected || loading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected || loading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            {t('connecting')}...
          </p>
        )}
      </div>
    </div>
  );
};

export default SupportChat;