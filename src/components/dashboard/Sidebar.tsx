
import { Calendar, Car, DollarSign, Star, User, Wrench, Bell, Zap, Clock, LogOut, X, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === "settings") {
      navigate("/settings");
    } else {
      setActiveTab(tabId);
    }
    if (setIsSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: "bookings", label: t("bookings"), icon: Calendar },
    { id: "services", label: t("services"), icon: Car },
    { id: "timeslots", label: t("timeSlots"), icon: Clock },
    { id: "mechanics", label: t("mechanics"), icon: Wrench },
    { id: "earnings", label: t("earnings"), icon: DollarSign },
    { id: "reviews", label: t("reviews"), icon: Star },
    { id: "garage-profile", label: t("garageProfile"), icon: User },
    { id: "verification", label: "Verification", icon: Shield },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "revvy", label: t("revvy"), icon: Zap },
    { id: "settings", label: t("settings"), icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-30">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Revonn</h1>
              <p className="text-xs text-gray-600">{t('dashboard')}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
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

          <div className="absolute bottom-6 left-6 right-6">
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              {t('signOut')}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Revonn</h1>
                <p className="text-xs text-gray-600">{t('dashboard')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen?.(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
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

          <div className="absolute bottom-6 left-6 right-6">
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              {t('signOut')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
