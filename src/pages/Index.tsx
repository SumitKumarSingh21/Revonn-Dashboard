
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, MessageSquare, DollarSign, Users, Clock, Shield, Zap } from "lucide-react";
import TermsAndConditions from "@/components/TermsAndConditions";
import PrivacyPolicy from "@/components/PrivacyPolicy";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Revonn</h1>
                <p className="text-xs text-gray-600">Beyond Class</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate("/services")}>
                Browse Services
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center p-2 bg-red-100 rounded-full mb-4">
              <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to Revonn
              <span className="text-red-600 block">Beyond Class</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Complete garage management solution with real-time updates, customer communication, 
              booking management, and earnings tracking. Everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-3">
                Start Managing Today
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" onClick={() => navigate("/services")}>
                Browse Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Garage
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for garage owners and mechanics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Smart Booking Management</CardTitle>
                <CardDescription>
                  Handle customer appointments with real-time updates and automatic notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Real-time booking updates</li>
                  <li>• Customer information tracking</li>
                  <li>• Service scheduling</li>
                  <li>• Status management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Real-time Messaging</CardTitle>
                <CardDescription>
                  Communicate with customers instantly with built-in messaging system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Instant customer communication</li>
                  <li>• Message history tracking</li>
                  <li>• Real-time notifications</li>
                  <li>• Multi-booking conversations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-yellow-600 mb-4" />
                <CardTitle>Earnings Analytics</CardTitle>
                <CardDescription>
                  Track your revenue with detailed analytics and financial insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Revenue tracking</li>
                  <li>• Payment method analytics</li>
                  <li>• Monthly/weekly reports</li>
                  <li>• Transaction history</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Service Management</CardTitle>
                <CardDescription>
                  Organize and manage all your garage services with pricing and duration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Service catalog management</li>
                  <li>• Dynamic pricing</li>
                  <li>• Service categorization</li>
                  <li>• Duration tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Get instant updates on all activities with live data synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Live data synchronization</li>
                  <li>• Instant notifications</li>
                  <li>• Real-time dashboard</li>
                  <li>• Multi-device support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-indigo-600 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Built with enterprise-grade security and reliable cloud infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Bank-level security</li>
                  <li>• Data encryption</li>
                  <li>• Automatic backups</li>
                  <li>• 99.9% uptime</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Garage Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of garage owners who have streamlined their operations with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-3"
            >
              Get Started for Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/services")}
              className="text-lg px-8 py-3 bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
            >
              Find Services Near You
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-red-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/lovable-uploads/abba9adf-0296-4e5e-a02b-8c714c4c5306.png" alt="Revonn Logo" className="h-12 w-12 mr-3" />
            <div className="text-left">
              <span className="text-2xl font-bold text-red-100">Revonn</span>
              <p className="text-red-300 text-sm">Beyond Class</p>
            </div>
          </div>
          <p className="text-red-200 mb-6">
            Complete garage management solution for modern automotive businesses
          </p>
          <div className="flex justify-center space-x-6 text-sm text-red-300">
            <PrivacyPolicy>
              <button className="hover:text-red-100 transition-colors">Privacy Policy</button>
            </PrivacyPolicy>
            <TermsAndConditions>
              <button className="hover:text-red-100 transition-colors">Terms & Conditions</button>
            </TermsAndConditions>
            <a href="#" className="hover:text-red-100 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
