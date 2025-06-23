
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Calendar, Users, Star } from "lucide-react";
import BookingsTab from "@/components/dashboard/BookingsTab";
import ServicesTab from "@/components/dashboard/ServicesTab";
import EarningsTab from "@/components/dashboard/EarningsTab";
import ReviewsTab from "@/components/dashboard/ReviewsTab";
import NotificationsTab from "@/components/dashboard/NotificationsTab";
import RevvyTab from "@/components/dashboard/RevvyTab";
import GarageProfileTab from "@/components/dashboard/GarageProfileTab";
import Sidebar from "@/components/dashboard/Sidebar";
import { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("garage-profile");
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalEarnings: 0,
    activeServices: 0,
    totalReviews: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // Listen for URL changes to update active tab
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab') || 'garage-profile';
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial tab from URL
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab') || 'garage-profile';
    setActiveTab(tab);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  useEffect(() => {
    if (user) {
      loadStats(user.id);
      
      // Set up real-time subscriptions for all relevant tables
      const channel = supabase
        .channel("dashboard-updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
          console.log("Bookings updated");
          loadStats(user.id);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "earnings" }, () => {
          console.log("Earnings updated");
          loadStats(user.id);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
          console.log("Messages updated");
          loadStats(user.id);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "services" }, () => {
          console.log("Services updated");
          loadStats(user.id);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "garages" }, () => {
          console.log("Garages updated");
          loadStats(user.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      // Get garage owned by user
      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", userId)
        .single();

      if (!garage) return;

      // Load statistics
      const [bookingsResult, earningsResult, servicesResult, reviewsResult] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact" }).eq("garage_id", garage.id),
        supabase.from("earnings").select("amount").eq("garage_id", garage.id),
        supabase.from("services").select("id", { count: "exact" }).eq("garage_id", garage.id),
        supabase.from("reviews").select("id", { count: "exact" }).eq("garage_id", garage.id)
      ]);

      const totalEarnings = earningsResult.data?.reduce((sum, earning) => sum + Number(earning.amount), 0) || 0;

      setStats({
        totalBookings: bookingsResult.count || 0,
        totalEarnings,
        activeServices: servicesResult.count || 0,
        totalReviews: reviewsResult.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar stats={stats} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">All time bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeServices}</div>
                <p className="text-xs text-muted-foreground">Available services</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews}</div>
                <p className="text-xs text-muted-foreground">Customer reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Content */}
          <Tabs value={activeTab} className="space-y-4">
            <TabsContent value="garage-profile">
              <GarageProfileTab user={user!} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="services">
              <ServicesTab />
            </TabsContent>

            <TabsContent value="earnings">
              <EarningsTab />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsTab />
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
