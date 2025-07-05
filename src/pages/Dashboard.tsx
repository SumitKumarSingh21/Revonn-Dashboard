
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@supabase/supabase-js";
import Sidebar from "@/components/dashboard/Sidebar";
import BookingsTab from "@/components/dashboard/BookingsTab";
import ServicesTab from "@/components/dashboard/ServicesTab";
import EarningsTab from "@/components/dashboard/EarningsTab";
import MessagesTab from "@/components/dashboard/MessagesTab";
import ReviewsTab from "@/components/dashboard/ReviewsTab";
import GarageProfileTab from "@/components/dashboard/GarageProfileTab";
import MechanicsTab from "@/components/dashboard/MechanicsTab";
import NotificationsTab from "@/components/dashboard/NotificationsTab";
import RevvyTab from "@/components/dashboard/RevvyTab";
import TimeSlotManagement from "@/components/dashboard/TimeSlotManagement";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
    } else {
      setUser(session.user);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="bookings">
              <BookingsTab />
            </TabsContent>
            <TabsContent value="services">
              <ServicesTab />
            </TabsContent>
            <TabsContent value="timeslots">
              <TimeSlotManagement />
            </TabsContent>
            <TabsContent value="mechanics">
              <MechanicsTab />
            </TabsContent>
            <TabsContent value="earnings">
              <EarningsTab />
            </TabsContent>
            <TabsContent value="messages">
              <MessagesTab />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTab />
            </TabsContent>
            <TabsContent value="garage-profile">
              <GarageProfileTab user={user} />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab />
            </TabsContent>
            <TabsContent value="revvy">
              <RevvyTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
