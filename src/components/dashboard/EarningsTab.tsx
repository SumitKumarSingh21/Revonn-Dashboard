
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, CreditCard, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface Earning {
  id: string;
  amount: number;
  payment_method: string | null;
  status: string;
  transaction_date: string | null;
  bookings: { customer_name: string | null } | null;
}

const EarningsTab = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    averageTransaction: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadEarnings();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    console.log("Setting up real-time earnings subscription");
    
    const channel = supabase
      .channel("earnings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "earnings" }, (payload) => {
        console.log("Real-time earnings update:", payload);
        loadEarnings();
        
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Payment Received!",
            description: `₹${payload.new.amount} payment received`,
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        console.log("Real-time booking update affecting earnings:", payload);
        loadEarnings();
      })
      .subscribe((status) => {
        console.log("Earnings subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadEarnings = async () => {
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
        .from("earnings")
        .select(`
          *,
          bookings (customer_name)
        `)
        .eq("garage_id", garage.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;

      const earningsData = data || [];
      setEarnings(earningsData);
      calculateStats(earningsData);
      generateChartData(earningsData);
      generatePaymentMethodData(earningsData);
    } catch (error) {
      console.error("Error loading earnings:", error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (earningsData: Earning[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
    
    const monthlyEarnings = earningsData
      .filter(earning => new Date(earning.transaction_date || "") >= oneMonthAgo)
      .reduce((sum, earning) => sum + earning.amount, 0);
    
    const weeklyEarnings = earningsData
      .filter(earning => new Date(earning.transaction_date || "") >= oneWeekAgo)
      .reduce((sum, earning) => sum + earning.amount, 0);

    const averageTransaction = earningsData.length > 0 ? totalEarnings / earningsData.length : 0;

    setStats({
      totalEarnings,
      monthlyEarnings,
      weeklyEarnings,
      averageTransaction,
    });
  };

  const generateChartData = (earningsData: Earning[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const chartData = last30Days.map(date => {
      const dayEarnings = earningsData
        .filter(earning => earning.transaction_date?.split('T')[0] === date)
        .reduce((sum, earning) => sum + earning.amount, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: dayEarnings,
      };
    });

    setChartData(chartData);
  };

  const generatePaymentMethodData = (earningsData: Earning[]) => {
    const methodCounts = earningsData.reduce((acc, earning) => {
      const method = earning.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + earning.amount;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(methodCounts).map(([method, amount]) => ({
      name: method,
      value: amount,
    }));

    setPaymentMethodData(data);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

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
        <h2 className="text-2xl font-bold">Earnings</h2>
        <p className="text-gray-600">Real-time revenue tracking and financial performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.weeklyEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.averageTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Trend</CardTitle>
            <CardDescription>Daily earnings over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Earnings']} />
                <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Revenue breakdown by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ₹${value}`}
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment transactions (Real-time updates)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.slice(0, 10).map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {earning.bookings?.customer_name || "Unknown Customer"}
                    </span>
                    <Badge variant={earning.status === "completed" ? "default" : "secondary"}>
                      {earning.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {earning.transaction_date ? 
                      new Date(earning.transaction_date).toLocaleString() : 
                      "Date not available"
                    }
                    {earning.payment_method && ` • ${earning.payment_method}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    +₹{earning.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {earnings.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings yet</h3>
              <p className="text-gray-500">Your transaction history will appear here in real-time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningsTab;
