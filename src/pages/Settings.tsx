
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Bell, Shield, Palette, Database, Trash2, Globe } from "lucide-react";
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
  const [language, setLanguage] = useState("en");
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
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC"
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Translations object
  const translations = {
    en: {
      settings: "Settings",
      manageAccount: "Manage your account and preferences",
      backToDashboard: "Back to Dashboard",
      profileInformation: "Profile Information",
      updatePersonal: "Update your personal information and profile details",
      fullName: "Full Name",
      enterFullName: "Enter your full name",
      username: "Username",
      enterUsername: "Enter your username",
      bio: "Bio",
      tellAboutYourself: "Tell us about yourself",
      phoneNumber: "Phone Number",
      enterPhoneNumber: "Enter your phone number",
      location: "Location",
      enterLocation: "Enter your location",
      saveProfile: "Save Profile",
      saving: "Saving...",
      languagePreferences: "Language Preferences",
      selectLanguage: "Select your preferred language",
      english: "English",
      hindi: "हिंदी",
      notificationPreferences: "Notification Preferences",
      manageNotifications: "Manage how you receive notifications",
      emailNotifications: "Email Notifications",
      receiveViaEmail: "Receive notifications via email",
      bookingNotifications: "Booking Notifications",
      newBookings: "Get notified about new bookings",
      paymentNotifications: "Payment Notifications",
      getPaymentNotified: "Get notified about payments",
      reviewNotifications: "Review Notifications",
      newReviews: "Get notified about new reviews",
      accountActions: "Account Actions",
      manageSecurity: "Manage your account security and sessions",
      signOut: "Sign Out",
      dangerZone: "Danger Zone",
      deleteWarning: "Once you delete your profile, there is no going back. Please be certain.",
      deleteProfile: "Delete Profile",
      confirmDelete: "Are you absolutely sure?",
      deleteDescription: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers including your profile, bookings, and any other associated information.",
      cancel: "Cancel",
      yesDelete: "Yes, delete my profile",
      deleting: "Deleting...",
      success: "Success",
      profileUpdated: "Profile updated successfully",
      error: "Error",
      failedUpdate: "Failed to update profile",
      accountDeleted: "Account Deleted",
      profileDeleted: "Your profile has been permanently deleted",
      failedDelete: "Failed to delete profile. Please try again.",
      failedSignOut: "Failed to sign out"
    },
    hi: {
      settings: "सेटिंग्स",
      manageAccount: "अपने खाते और प्राथमिकताओं को प्रबंधित करें",
      backToDashboard: "डैशबोर्ड पर वापस जाएं",
      profileInformation: "प्रोफ़ाइल जानकारी",
      updatePersonal: "अपनी व्यक्तिगत जानकारी और प्रोफ़ाइल विवरण अपडेट करें",
      fullName: "पूरा नाम",
      enterFullName: "अपना पूरा नाम दर्ज करें",
      username: "उपयोगकर्ता नाम",
      enterUsername: "अपना उपयोगकर्ता नाम दर्ज करें",
      bio: "बायो",
      tellAboutYourself: "हमें अपने बारे में बताएं",
      phoneNumber: "फ़ोन नंबर",
      enterPhoneNumber: "अपना फ़ोन नंबर दर्ज करें",
      location: "स्थान",
      enterLocation: "अपना स्थान दर्ज करें",
      saveProfile: "प्रोफ़ाइल सेव करें",
      saving: "सेव हो रहा है...",
      languagePreferences: "भाषा प्राथमिकताएं",
      selectLanguage: "अपनी पसंदीदा भाषा चुनें",
      english: "English",
      hindi: "हिंदी",
      notificationPreferences: "अधिसूचना प्राथमिकताएं",
      manageNotifications: "अधिसूचनाएं कैसे प्राप्त करें इसे प्रबंधित करें",
      emailNotifications: "ईमेल अधिसूचनाएं",
      receiveViaEmail: "ईमेल के माध्यम से अधिसूचनाएं प्राप्त करें",
      bookingNotifications: "बुकिंग अधिसूचनाएं",
      newBookings: "नई बुकिंग के बारे में सूचित रहें",
      paymentNotifications: "भुगतान अधिसूचनाएं",
      getPaymentNotified: "भुगतान के बारे में सूचित रहें",
      reviewNotifications: "समीक्षा अधिसूचनाएं",
      newReviews: "नई समीक्षाओं के बारे में सूचित रहें",
      accountActions: "खाता कार्रवाई",
      manageSecurity: "अपने खाते की सुरक्षा और सत्रों को प्रबंधित करें",
      signOut: "साइन आउट",
      dangerZone: "खतरे का क्षेत्र",
      deleteWarning: "एक बार जब आप अपनी प्रोफ़ाइल हटा देते हैं, तो वापसी नहीं है। कृपया निश्चित रहें।",
      deleteProfile: "प्रोफ़ाइल हटाएं",
      confirmDelete: "क्या आप बिल्कुल निश्चित हैं?",
      deleteDescription: "यह कार्रवाई पूर्ववत नहीं की जा सकती। यह स्थायी रूप से आपके खाते को हटा देगा और हमारे सर्वर से आपका सभी डेटा हटा देगा जिसमें आपकी प्रोफ़ाइल, बुकिंग और कोई अन्य संबंधित जानकारी शामिल है।",
      cancel: "रद्द करें",
      yesDelete: "हां, मेरी प्रोफ़ाइल हटाएं",
      deleting: "हटाया जा रहा है...",
      success: "सफलता",
      profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई",
      error: "त्रुटि",
      failedUpdate: "प्रोफ़ाइल अपडेट करने में विफल",
      accountDeleted: "खाता हटा दिया गया",
      profileDeleted: "आपकी प्रोफ़ाइल स्थायी रूप से हटा दी गई है",
      failedDelete: "प्रोफ़ाइल हटाने में विफल। कृपया पुनः प्रयास करें।",
      failedSignOut: "साइन आउट करने में विफल"
    }
  };

  const t = translations[language as keyof typeof translations];

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
        title: t.success,
        description: t.profileUpdated,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: t.error,
        description: t.failedUpdate,
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
        title: t.accountDeleted,
        description: t.profileDeleted,
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: t.error,
        description: t.failedDelete,
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
        title: t.error,
        description: t.failedSignOut,
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
                {t.backToDashboard}
              </Button>
              <div className="flex items-center">
                <img src="/lovable-uploads/f2edf4d2-fb05-49d3-bf90-027c5a657e2a.png" alt="Revonn Logo" className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-lg font-semibold">{t.settings}</h1>
                  <p className="text-sm text-gray-600">{t.manageAccount}</p>
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
                <CardTitle>{t.languagePreferences}</CardTitle>
              </div>
              <CardDescription>
                {t.selectLanguage}
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
                    <SelectItem value="en">{t.english}</SelectItem>
                    <SelectItem value="hi">{t.hindi}</SelectItem>
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
                <CardTitle>{t.profileInformation}</CardTitle>
              </div>
              <CardDescription>
                {t.updatePersonal}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t.fullName}</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder={t.enterFullName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder={t.enterUsername}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">{t.bio}</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder={t.tellAboutYourself}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phoneNumber}</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder={t.enterPhoneNumber}
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">{t.location}</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder={t.enterLocation}
                  />
                </div>
              </div>

              <Button onClick={saveProfile} disabled={saving} className="w-full md:w-auto">
                {saving ? t.saving : t.saveProfile}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                <CardTitle>{t.notificationPreferences}</CardTitle>
              </div>
              <CardDescription>
                {t.manageNotifications}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email_notifications">{t.emailNotifications}</Label>
                    <p className="text-sm text-gray-500">{t.receiveViaEmail}</p>
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
                    <Label htmlFor="booking_notifications">{t.bookingNotifications}</Label>
                    <p className="text-sm text-gray-500">{t.newBookings}</p>
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
                    <Label htmlFor="payment_notifications">{t.paymentNotifications}</Label>
                    <p className="text-sm text-gray-500">{t.getPaymentNotified}</p>
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
                    <Label htmlFor="review_notifications">{t.reviewNotifications}</Label>
                    <p className="text-sm text-gray-500">{t.newReviews}</p>
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
                <CardTitle>{t.accountActions}</CardTitle>
              </div>
              <CardDescription>
                {t.manageSecurity}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full md:w-auto"
                >
                  {t.signOut}
                </Button>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">{t.dangerZone}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t.deleteWarning}
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full md:w-auto">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.deleteProfile}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.confirmDelete}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.deleteDescription}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteProfile}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? t.deleting : t.yesDelete}
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
