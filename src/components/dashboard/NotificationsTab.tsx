
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, Calendar, MessageSquare, DollarSign, AlertCircle, Star, Settings, Loader2 } from "lucide-react";

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
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    const unsubscribe = setupRealtimeSubscriptions();
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Browser notification permission:', permission);
      });
    }

    return unsubscribe;
  }, []);

  const createTestNotification = async () => {
    try {
      setTestLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create test notifications",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating test notification for user:", user.user.id);

      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.user.id,
          type: "booking",
          title: "🧪 Test Notification",
          message: `Test notification created at ${new Date().toLocaleTimeString()} - System is working correctly!`,
          data: {
            test: true,
            timestamp: new Date().toISOString(),
            source: "manual_test"
          }
        });

      if (error) {
        console.error("Error creating test notification:", error);
        throw error;
      }

      console.log("Test notification created successfully");
      toast({
        title: "Success",
        description: "Test notification created! You should see it appear in real-time.",
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      toast({
        title: "Error",
        description: `Failed to create test notification: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    console.log("Setting up notification real-time subscriptions");
    
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "notifications" 
      }, (payload) => {
        console.log("🔔 New notification received via real-time:", payload);
        
        if (payload.new) {
          const newNotification = payload.new as Notification;
          
          // Add to notifications list at the top
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 8000,
          });
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/lovable-uploads/7a2c0481-ceb6-477c-b9ef-b6e8e634b7f9.png',
              badge: '/lovable-uploads/7a2c0481-ceb6-477c-b9ef-b6e8e634b7f9.png',
              tag: newNotification.id // Prevent duplicate notifications
            });

            // Auto-close after 10 seconds
            setTimeout(() => {
              browserNotification.close();
            }, 10000);
          }
        }
      })
      .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "notifications" 
      }, (payload) => {
        console.log("📝 Notification updated via real-time:", payload);
        if (payload.new) {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      })
      .on("postgres_changes", { 
        event: "DELETE", 
        schema: "public", 
        table: "notifications" 
      }, (payload) => {
        console.log("🗑️ Notification deleted via real-time:", payload);
        if (payload.old) {
          const deletedNotification = payload.old as Notification;
          setNotifications(prev => 
            prev.filter(notif => notif.id !== deletedNotification.id)
          );
        }
      })
      .subscribe((status) => {
        console.log("📡 Notifications subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("✅ Successfully subscribed to notifications real-time updates");
          toast({
            title: "Real-time Connected",
            description: "You'll now receive live notifications!",
            duration: 3000,
          });
        } else if (status === 'CHANNEL_ERROR') {
          console.error("❌ Error subscribing to notifications");
          toast({
            title: "Connection Error",
            description: "Failed to connect to real-time notifications",
            variant: "destructive",
          });
        }
      });

    return () => {
      console.log("🔌 Cleaning up notifications subscription");
      supabase.removeChannel(channel);
    };
  };

  const loadNotifications = async () => {
    try {
      console.log("📂 Loading notifications...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("❌ No authenticated user");
        return;
      }

      console.log("👤 Loading notifications for user:", user.user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(50); // Limit to recent 50 notifications

      if (error) {
        console.error("❌ Error loading notifications:", error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} notifications:`, data);
      setNotifications(data || []);
    } catch (error) {
      console.error("❌ Error loading notifications:", error);
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

      toast({
        title: "Marked as read",
        description: "Notification marked as read",
        duration: 2000,
      });
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
        .update({ read: true }) // We'll just mark as read instead of deleting
        .eq("id", notificationId);

      if (error) throw error;

      toast({
        title: "Archived",
        description: "Notification archived successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error archiving notification:", error);
      toast({
        title: "Error",
        description: "Failed to archive notification",
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

      toast({
        title: "All marked as read",
        description: "All notifications marked as read",
        duration: 2000,
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
        return <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case "payment":
        return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
      case "review":
        return <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />;
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center flex-wrap gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time updates for bookings, messages, and payments
          </p>
          {Notification?.permission === 'granted' && (
            <Badge variant="outline" className="text-green-600 border-green-200 text-xs w-fit">
              🔔 Browser notifications enabled
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={createTestNotification}
            disabled={testLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            {testLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Test Notification
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-300 hover:shadow-md border-l-4 ${
              !notification.read 
                ? "border-l-blue-500 bg-blue-50/50 shadow-sm" 
                : "border-l-gray-200"
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                        {notification.title}
                      </h3>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge 
                          className={`${getNotificationColor(notification.type)} text-xs`} 
                          variant="secondary"
                        >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            NEW
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed break-words">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Read
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 px-2 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1 text-red-500" />
                          Archive
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12 px-4">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-md mx-auto">
              You'll receive real-time notifications when customers book services, send messages, or leave reviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Badge variant="outline" className="text-green-600 border-green-200">
                ✓ Real-time enabled
              </Badge>
              {Notification?.permission === 'granted' && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  ✓ Browser notifications on
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsTab;
