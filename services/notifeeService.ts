import notifee from '@notifee/react-native';

// foreground service burada başlar
export function registerNotifeeService() {
  notifee.registerForegroundService(() => {
    return new Promise(() => {
      // resolve ETME → servis sürekli çalışsın
    });
  });
}