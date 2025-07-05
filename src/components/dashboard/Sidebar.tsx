
import { Calendar, Car, DollarSign, Star, User, Wrench, Bell, Zap, Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "services", label: "Services", icon: Car },
    { id: "timeslots", label: "Time Slots", icon: Clock },
    { id: "mechanics", label: "Mechanics", icon: Wrench },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "garage-profile", label: "Garage Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "revvy", label: "Revvy", icon: Zap },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Revonn</h1>
            <p className="text-xs text-gray-600">Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6">
          <Button variant="outline" onClick={handleSignOut} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
