
import { useEffect, useState } from 'react';
import { pushNotificationService } from '@/utils/pushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Smartphone, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';

const PushNotificationSetup = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      pushNotificationService.initialize();
      setNotificationsEnabled(true);
    } else {
      // Check web notification permission
      setNotificationsEnabled(Notification?.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      await pushNotificationService.initialize();
      setNotificationsEnabled(true);
    } else {
      const granted = await pushNotificationService.requestWebNotificationPermission();
      setNotificationsEnabled(granted);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-blue-600" />
          Push Notifications
        </CardTitle>
        <CardDescription className="text-sm">
          Get instant alerts when customers book services at your garage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isNative ? (
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-800 text-sm">Mobile App Detected</p>
                <p className="text-xs text-green-600 break-words">
                  You'll receive push notifications directly on your mobile device
                </p>
              </div>
              {notificationsEnabled && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Web Browser Notifications</p>
                <p className="text-xs text-gray-600 break-words">
                  Enable browser notifications to get alerted about new bookings
                </p>
              </div>
              {notificationsEnabled && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
            </div>
          )}

          {!notificationsEnabled && (
            <Button onClick={handleEnableNotifications} className="w-full text-sm py-2">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          )}

          {notificationsEnabled && (
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-green-800">
                  Notifications are enabled! You'll receive alerts for:
                </span>
              </div>
              <ul className="text-xs text-green-700 ml-6 list-disc space-y-1">
                <li>New booking requests</li>
                <li>Booking status updates</li>
                <li>Payment confirmations</li>
                <li>Customer messages</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationSetup;
