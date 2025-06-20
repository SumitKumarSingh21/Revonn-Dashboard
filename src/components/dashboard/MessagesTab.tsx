
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User } from "lucide-react";

interface Message {
  id: string;
  message: string;
  sender_type: string;
  sender_id: string;
  created_at: string;
  booking_id: string;
  bookings: {
    customer_name: string | null;
  } | null;
}

interface Booking {
  id: string;
  customer_name: string | null;
}

const MessagesTab = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking) {
      loadMessages(selectedBooking);
    }
  }, [selectedBooking]);

  useEffect(() => {
    const channel = supabase
      .channel("messages-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'booking_id' in payload.new && selectedBooking === payload.new.booking_id) {
          loadMessages(selectedBooking);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBooking]);

  const loadBookings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("id, customer_name")
        .eq("garage_id", garage.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
      
      if (data && data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0].id);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          bookings (customer_name)
        `)
        .eq("booking_id", bookingId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedBooking) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from("messages")
        .insert([{
          booking_id: selectedBooking,
          message: newMessage.trim(),
          sender_type: "garage",
          sender_id: user.user.id,
        }]);

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-gray-600">Communicate with your customers in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Bookings List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
            <CardDescription>Select a booking to view messages</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="space-y-2 p-4">
                {bookings.map((booking) => (
                  <Button
                    key={booking.id}
                    variant={selectedBooking === booking.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedBooking(booking.id)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="truncate">
                      {booking.customer_name || `Booking #${booking.id.slice(0, 8)}`}
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-3">
          {selectedBooking ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {bookings.find(b => b.id === selectedBooking)?.customer_name || 
                   `Booking #${selectedBooking.slice(0, 8)}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[480px]">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4 p-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === "garage" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.sender_type === "garage"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === "garage" 
                              ? "text-blue-100" 
                              : "text-gray-500"
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[540px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-500">Select a booking to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {bookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Customer messages will appear here when bookings are made</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagesTab;
