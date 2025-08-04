
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";

const TestNotificationButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createTestNotification = async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to create test notifications",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: user.user.id,
          type: "booking",
          title: "Test Notification",
          message: "This is a test notification to verify the system is working correctly",
          data: {
            test: true,
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Test notification created successfully!",
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={createTestNotification}
      disabled={loading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      Create Test Notification
    </Button>
  );
};

export default TestNotificationButton;
