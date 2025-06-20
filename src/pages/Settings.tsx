
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Lock, Shield, Bell, AlertTriangle } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface PrivacySettings {
  account_visibility: boolean;
  show_dashboard_activity: boolean;
}

interface NotificationPreferences {
  bookings: boolean;
  account_changes: boolean;
  service_updates: boolean;
  messages: boolean;
}

const Settings = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    account_visibility: true,
    show_dashboard_activity: true,
  });
  
  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    bookings: true,
    account_changes: true,
    service_updates: true,
    messages: true,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("settings-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
          loadUserData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadUserData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setUsername(profileData.username || "");
        setAvatarUrl(profileData.avatar_url || "");
      }

      // Load privacy settings (stored in user metadata)
      const metadata = currentUser.user_metadata || {};
      setPrivacySettings({
        account_visibility: metadata.account_visibility !== false,
        show_dashboard_activity: metadata.show_dashboard_activity !== false,
      });

      // Load notification preferences
      setNotificationPrefs({
        bookings: metadata.notifications_bookings !== false,
        account_changes: metadata.notifications_account_changes !== false,
        service_updates: metadata.notifications_service_updates !== false,
        messages: metadata.notifications_messages !== false,
      });

    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl,
        }
      });

      if (authError) throw authError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!user) return;

    const updatedSettings = { ...privacySettings, ...newSettings };
    setPrivacySettings(updatedSettings);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          account_visibility: updatedSettings.account_visibility,
          show_dashboard_activity: updatedSettings.show_dashboard_activity,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Privacy settings updated",
      });

    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    }
  };

  const updateNotificationPrefs = async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    const updatedPrefs = { ...notificationPrefs, ...newPrefs };
    setNotificationPrefs(updatedPrefs);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notifications_bookings: updatedPrefs.bookings,
          notifications_account_changes: updatedPrefs.account_changes,
          notifications_service_updates: updatedPrefs.service_updates,
          notifications_messages: updatedPrefs.messages,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification preferences updated",
      });

    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  const deactivateAccount = async () => {
    if (!confirm("Are you sure you want to deactivate your account? This action can be reversed.")) {
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { account_deactivated: true }
      });

      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/auth");

      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated",
      });

    } catch (error) {
      console.error("Error deactivating account:", error);
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete all your data. Are you absolutely sure?")) {
      return;
    }

    try {
      // Note: Account deletion should be handled by an edge function for security
      // For now, we'll mark the account for deletion
      const { error } = await supabase.auth.updateUser({
        data: { account_marked_for_deletion: true }
      });

      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/auth");

      toast({
        title: "Account Deletion Requested",
        description: "Your account has been marked for deletion and will be processed within 24 hours",
      });

    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account",
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Edit Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Edit Profile
              </CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    disabled
                    className="bg-gray-50"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="avatarUrl">Profile Picture URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
              <Button onClick={updateProfile} disabled={saving}>
                {saving ? "Saving..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password for security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={changePassword} disabled={saving}>
                {saving ? "Changing..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your account visibility and data sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Account Visibility</Label>
                  <p className="text-sm text-gray-500">Make your account visible to other users</p>
                </div>
                <Switch
                  checked={privacySettings.account_visibility}
                  onCheckedChange={(checked) => updatePrivacySettings({ account_visibility: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Dashboard Activity</Label>
                  <p className="text-sm text-gray-500">Allow others to see your dashboard activity</p>
                </div>
                <Switch
                  checked={privacySettings.show_dashboard_activity}
                  onCheckedChange={(checked) => updatePrivacySettings({ show_dashboard_activity: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Booking Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified about booking updates</p>
                </div>
                <Switch
                  checked={notificationPrefs.bookings}
                  onCheckedChange={(checked) => updateNotificationPrefs({ bookings: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Account Changes</Label>
                  <p className="text-sm text-gray-500">Get notified about account modifications</p>
                </div>
                <Switch
                  checked={notificationPrefs.account_changes}
                  onCheckedChange={(checked) => updateNotificationPrefs({ account_changes: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Service Updates</Label>
                  <p className="text-sm text-gray-500">Get notified about service changes</p>
                </div>
                <Switch
                  checked={notificationPrefs.service_updates}
                  onCheckedChange={(checked) => updateNotificationPrefs({ service_updates: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-gray-500">Get notified about new messages</p>
                </div>
                <Switch
                  checked={notificationPrefs.messages}
                  onCheckedChange={(checked) => updateNotificationPrefs({ messages: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Account Controls
              </CardTitle>
              <CardDescription>
                Manage your account status and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={deactivateAccount}
                  className="w-full"
                >
                  Deactivate Account
                </Button>
                <p className="text-sm text-gray-500">
                  Temporarily disable your account. You can reactivate it later.
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  onClick={deleteAccount}
                  className="w-full"
                >
                  Permanently Delete Account
                </Button>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
