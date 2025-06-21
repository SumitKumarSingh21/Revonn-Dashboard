
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Users,
  Activity,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  stats: {
    totalBookings: number;
    totalEarnings: number;
    activeServices: number;
    unreadMessages: number;
  };
}

const Sidebar = ({ stats }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({
    activeUsers: 0,
    todayBookings: 0,
    todayEarnings: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Calendar, label: "Bookings", value: "bookings", count: stats.totalBookings },
    { icon: Users, label: "Services", value: "services", count: stats.activeServices },
    { icon: DollarSign, label: "Earnings", value: "earnings", count: null },
    { icon: MessageSquare, label: "Messages", value: "messages", count: stats.unreadMessages },
    { icon: Bell, label: "Notifications", value: "notifications", count: null },
  ];

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        activeUsers: Math.floor(Math.random() * 50) + 10,
        todayBookings: Math.floor(Math.random() * 20) + 5,
        todayEarnings: Math.floor(Math.random() * 1000) + 200
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleNavigation = (value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  const currentTab = new URLSearchParams(location.search).get('tab') || 'bookings';

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/e3aae901-9e81-4067-a6fa-bf32ba3a4167.png" 
              alt="Revonn Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-semibold text-gray-900">Revonn Dashboard</h1>
          </div>
        </div>

        {/* Real-time Dashboard */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-green-500" />
            Live Dashboard
          </h2>
          <div className="space-y-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Active Users</p>
                  <p className="text-lg font-semibold text-green-600">{realtimeStats.activeUsers}</p>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Today's Bookings</p>
                  <p className="text-lg font-semibold text-blue-600">{realtimeStats.todayBookings}</p>
                </div>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Today's Earnings</p>
                  <p className="text-lg font-semibold text-purple-600">${realtimeStats.todayEarnings}</p>
                </div>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavigation(item.value)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg text-left
                transition-colors duration-200
                ${currentTab === item.value 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count !== null && item.count > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {item.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSettings}
          >
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
