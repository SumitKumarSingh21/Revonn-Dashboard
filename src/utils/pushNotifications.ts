
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

export class PushNotificationService {
  private static instance: PushNotificationService;
  
  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only work on native platforms');
      return;
    }

    console.log('Initializing push notifications...');

    // Request permission to use push notifications
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      await PushNotifications.register();
    } else {
      console.log('Push notification permission denied');
      return;
    }

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      await this.savePushToken(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      // Show local notification if app is in foreground
      this.showLocalNotification(notification.title || 'New Notification', notification.body || '');
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
      
      // Navigate to specific page based on notification data
      if (notification.notification.data?.page) {
        window.location.hash = notification.notification.data.page;
      }
    });
  }

  private async savePushToken(token: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from('garages')
        .select('id')
        .eq('owner_id', user.user.id)
        .single();

      if (!garage) return;

      // Save push token to database using the proper table name from schema
      const { error } = await supabase
        .from('garage_push_tokens')
        .upsert({
          garage_id: garage.id,
          push_token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error in savePushToken:', error);
    }
  }

  private showLocalNotification(title: string, body: string) {
    // For web platforms or when native notifications aren't available
    if (!Capacitor.isNativePlatform()) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  }

  async requestWebNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
