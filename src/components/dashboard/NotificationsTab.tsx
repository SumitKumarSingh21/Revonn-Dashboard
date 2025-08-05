
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    setupRealtimeSubscriptions();
    
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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
          title: "Test Notification",
          message: "This is a test notification to verify the system is working correctly at " + new Date().toLocaleTimeString(),
          data: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error("Error creating test notification:", error);
        throw error;
      }

      console.log("Test notification created successfully");
      toast({
        title: "Success",
        description: "Test notification created successfully!",
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      toast({
        title: "Error",
        description: "Failed to create test notification: " + error.message,
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
        console.log("New notification received:", payload);
        
        if (payload.new) {
          const newNotification = payload.new as Notification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/lovable-uploads/7a2c0481-ceb6-477c-b9ef-b6e8e634b7f9.png',
              badge: '/lovable-uploads/7a2c0481-ceb6-477c-b9ef-b6e8e634b7f9.png'
            });
          }
        }
      })
      .on("postgres_changes", { 
        event: "UPDATE", 
        schema: "public", 
        table: "notifications" 
      }, (payload) => {
        console.log("Notification updated:", payload);
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
        console.log("Notification deleted:", payload);
        if (payload.old) {
          const deletedNotification = payload.old as Notification;
          setNotifications(prev => 
            prev.filter(notif => notif.id !== deletedNotification.id)
          );
        }
      })
      .subscribe((status) => {
        console.log("Notifications subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to notifications real-time updates");
        }
      });

    return () => {
      console.log("Cleaning up notifications subscription");
      supabase.removeChannel(channel);
    };
  };

  const loadNotifications = async () => {
    try {
      console.log("Loading notifications...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("No authenticated user");
        return;
      }

      console.log("Loading notifications for user:", user.user.id);

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading notifications:", error);
        throw error;
      }

      console.log("Loaded notifications:", data);
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

      toast({
        title: "Success",
        description: "Notification marked as read",
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
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

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
        return <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />;
      case "message":
        return <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />;
      case "payment":
        return <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />;
      case "review":
        return <Star className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />;
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center flex-wrap gap-2">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time updates on your garage activities
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={createTestNotification}
            disabled={testLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
          >
            {testLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            Create Test Notification
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Mark all read
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`transition-all duration-200 hover:shadow-md ${
              !notification.read ? "border-blue-200 bg-blue-50/50 shadow-sm" : ""
            }`}
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center gap-2 mb-1 flex-col sm:flex-row sm:flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                        {notification.title}
                      </h3>
                      <div className="flex gap-1 sm:gap-2 flex-wrap">
                        <Badge 
                          className={`${getNotificationColor(notification.type)} text-xs`} 
                          variant="secondary"
                        >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs animate-pulse">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed break-words">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete notification"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 max-w-md mx-auto">
              You'll receive real-time notifications about bookings, messages, reviews, and payments here
            </p>
            <Badge variant="outline" className="text-green-600 border-green-200 text-xs sm:text-sm">
              Real-time updates enabled ✓
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsTab;
