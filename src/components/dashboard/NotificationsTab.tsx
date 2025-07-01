
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Calendar, MessageSquare, DollarSign, AlertCircle, Star, Settings } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data: any;
  created_at: string;
}

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = () => {
    console.log("Setting up comprehensive real-time notification subscriptions");
    
    const channel = supabase
      .channel("all-notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        console.log("Real-time notification change:", payload);
        
        if (payload.eventType === 'INSERT') {
          const newNotification = payload.new as Notification;
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
          
          // Play notification sound (optional)
          try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(() => console.log('Could not play notification sound'));
          } catch (e) {
            console.log('Notification sound not available');
          }
        }
        
        loadNotifications();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        console.log("Real-time booking change for notifications:", payload);
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Booking Alert!",
            description: "You have received a new booking request",
            duration: 5000,
          });
        } else if (payload.eventType === 'UPDATE') {
          toast({
            title: "Booking Updated",
            description: "One of your bookings has been updated",
            duration: 3000,
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "earnings" }, (payload) => {
        console.log("Real-time payment notification:", payload);
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "Payment Received!",
            description: `New payment of ₹${payload.new.amount} received`,
            duration: 5000,
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, (payload) => {
        console.log("Real-time review notification:", payload);
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Review!",
            description: `You received a ${payload.new.rating}-star review`,
            duration: 5000,
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        console.log("Real-time message notification:", payload);
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Message",
            description: "You have received a new message",
            duration: 4000,
          });
        }
      })
      .subscribe((status) => {
        console.log("Comprehensive notifications subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadNotifications = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "payment":
        return <DollarSign className="h-5 w-5 text-yellow-600" />;
      case "review":
        return <Star className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-800";
      case "message":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-yellow-100 text-yellow-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">
            Real-time updates on your garage activities
          </p>
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.open('/settings', '_blank')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-md transition-all duration-200 ${
              !notification.read ? "border-blue-200 bg-blue-50/50 shadow-sm" : ""
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge className={getNotificationColor(notification.type)} variant="secondary">
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <Badge variant="destructive" className="animate-pulse">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 leading-relaxed">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 mb-4">
              You'll receive real-time notifications about bookings, messages, reviews, and payments here
            </p>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Real-time updates enabled ✓
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsTab;
