
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Bell, Shield, Globe, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    phone: "",
    location: ""
  });
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    booking_notifications: true,
    payment_notifications: true,
    review_notifications: true
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await loadProfile(session.user.id);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          phone: data.phone || "",
          location: data.location || ""
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('profileUpdated'),
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: t('error'),
        description: t('failedUpdate'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async () => {
    if (!user) return;
    
    setDeleting(true);
    try {
      // Delete user account from auth (this will cascade delete profile due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        // If admin delete fails, try to delete profile and sign out
        await supabase.from("profiles").delete().eq("id", user.id);
        await supabase.auth.signOut();
      } else {
        // Sign out after successful deletion
        await supabase.auth.signOut();
      }

      toast({
        title: t('accountDeleted'),
        description: t('profileDeleted'),
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: t('error'),
        description: t('failedDelete'),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: t('error'),
        description: t('failedSignOut'),
        variant: "destructive",
      });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToDashboard')}
              </Button>
              <div className="flex items-center">
                <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold">{t('settings')}</h1>
                  <p className="text-sm text-gray-600">{t('manageAccount')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Language Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <CardTitle>{t('languagePreferences')}</CardTitle>
              </div>
              <CardDescription>
                {t('selectLanguage')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    <SelectItem value="hi">{t('hindi')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <CardTitle>{t('profileInformation')}</CardTitle>
              </div>
              <CardDescription>
                {t('updatePersonal')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('fullName')}</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t('enterFullName')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('username')}</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder={t('enterUsername')}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">{t('bio')}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder={t('tellAboutYourself')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phoneNumber')}</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder={t('enterPhoneNumber')}
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t('location')}</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder={t('enterLocation')}
                  />
                </div>
              </div>

              <Button onClick={saveProfile} disabled={saving} className="w-full md:w-auto">
                {saving ? t('saving') : t('saveProfile')}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <CardTitle>{t('notificationPreferences')}</CardTitle>
              </div>
              <CardDescription>
                {t('manageNotifications')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">{t('emailNotifications')}</Label>
                    <p className="text-sm text-gray-500">{t('receiveViaEmail')}</p>
                  </div>
                  <Switch
                    id="email_notifications"
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, email_notifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="booking_notifications">{t('bookingNotifications')}</Label>
                    <p className="text-sm text-gray-500">{t('newBookings')}</p>
                  </div>
                  <Switch
                    id="booking_notifications"
                    checked={notifications.booking_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, booking_notifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment_notifications">{t('paymentNotifications')}</Label>
                    <p className="text-sm text-gray-500">{t('getPaymentNotified')}</p>
                  </div>
                  <Switch
                    id="payment_notifications"
                    checked={notifications.payment_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, payment_notifications: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="review_notifications">{t('reviewNotifications')}</Label>
                    <p className="text-sm text-gray-500">{t('newReviews')}</p>
                  </div>
                  <Switch
                    id="review_notifications"
                    checked={notifications.review_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, review_notifications: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <CardTitle>{t('accountActions')}</CardTitle>
              </div>
              <CardDescription>
                {t('manageSecurity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full md:w-auto"
                >
                  {t('signOut')}
                </Button>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">{t('dangerZone')}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('deleteWarning')}
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full md:w-auto">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('deleteProfile')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteDescription')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteProfile}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? t('deleting') : t('yesDelete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
