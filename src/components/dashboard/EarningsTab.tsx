import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, CreditCard, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { VerificationBanner } from "@/components/verification/VerificationBanner";

interface Earning {
  id: string;
  amount: number;
  payment_method: string | null;
  status: string;
  transaction_date: string | null;
  customer_name?: string;
}

interface GarageData {
  id: string;
  verification_status: 'pending' | 'verified' | 'provisional' | 'certified' | 'rejected';
  verification_badge_color: string;
  bank_verification?: Array<{
    status: 'pending' | 'verified' | 'rejected';
    bank_name: string;
    account_holder_name: string;
  }>;
}

const EarningsTab = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [garageData, setGarageData] = useState<GarageData | null>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    averageTransaction: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage, error: garageError } = await supabase
        .from('garages')
        .select('*, bank_verification(*)')
        .eq('owner_id', user.user.id)
        .single();

      if (garageError) {
        console.error('Error fetching garage:', garageError);
        return;
      }

      // Transform bank_verification data to match interface
      const transformedGarage = {
        ...garage,
        bank_verification: garage.bank_verification ? [garage.bank_verification].map(bv => ({
          status: bv.status,
          bank_name: bv.bank_name,
          account_holder_name: bv.account_holder_name
        })) : []
      };

      setGarageData(transformedGarage);

      if (garage.verification_status === 'pending') {
        setLoading(false);
        return;
      }

      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*, bookings!inner(customer_name)')
        .eq('garage_id', garage.id)
        .order('transaction_date', { ascending: false });

      if (earningsError) {
        console.error('Error fetching earnings:', earningsError);
        return;
      }

      const formattedEarnings = earningsData.map(earning => ({
        ...earning,
        customer_name: earning.bookings?.customer_name || 'Unknown Customer'
      }));

      setEarnings(formattedEarnings);
      calculateStats(formattedEarnings);
      
    } catch (error) {
      console.error('Error in loadEarnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (earningsData: Earning[]) => {
    const total = earningsData.reduce((sum, earning) => sum + Number(earning.amount), 0);
    
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthlyEarnings = earningsData
      .filter(e => e.transaction_date && new Date(e.transaction_date) >= oneMonthAgo)
      .reduce((sum, earning) => sum + Number(earning.amount), 0);

    const weeklyEarnings = earningsData
      .filter(e => e.transaction_date && new Date(e.transaction_date) >= oneWeekAgo)
      .reduce((sum, earning) => sum + Number(earning.amount), 0);

    const averageTransaction = earningsData.length > 0 ? total / earningsData.length : 0;

    setStats({
      totalEarnings: total,
      monthlyEarnings,
      weeklyEarnings,
      averageTransaction
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (garageData && garageData.verification_status === 'pending') {
    return (
      <div className="space-y-6">
        <VerificationBanner
          verificationStatus={garageData.verification_status}
          badgeColor={garageData.verification_badge_color}
          hasDocuments={false}
          hasBankDetails={false}
          onNavigateToVerification={() => navigate('/dashboard?tab=verification')}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Earnings & Payouts</CardTitle>
            <CardDescription>
              Complete your garage verification to access earnings tracking and payout features.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {garageData && (
        <VerificationBanner
          verificationStatus={garageData.verification_status}
          badgeColor={garageData.verification_badge_color}
          hasDocuments={garageData.verification_status !== 'pending'}
          hasBankDetails={garageData.bank_verification && garageData.bank_verification.length > 0}
          bankStatus={garageData.bank_verification?.[0]?.status}
          onNavigateToVerification={() => navigate('/dashboard?tab=verification')}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold">Earnings</h2>
        <p className="text-gray-600">Real-time revenue tracking and financial performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.monthlyEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.weeklyEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(stats.averageTransaction).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest earnings from completed bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No earnings recorded yet. Complete some bookings to see your earnings here.
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{earning.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {earning.transaction_date && new Date(earning.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{Number(earning.amount).toLocaleString()}</p>
                    <Badge variant={earning.status === 'completed' ? 'default' : 'secondary'}>
                      {earning.payment_method || 'Cash'}
                    </Badge>
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

export default EarningsTab;