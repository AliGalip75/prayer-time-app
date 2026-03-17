// utils/notifications.ts
import * as Notifications from 'expo-notifications';

export async function schedulePrayerNotifications(timings: any, city: string) {
  // Clear previously scheduled notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!timings || !city) return;

  const prayers = [
    { label: 'İmsak', time: timings.Imsak },
    { label: 'Güneş', time: timings.Sunrise },
    { label: 'Öğle', time: timings.Dhuhr },
    { label: 'İkindi', time: timings.Asr },
    { label: 'Akşam', time: timings.Maghrib },
    { label: 'Yatsı', time: timings.Isha },
  ];

  const now = new Date();

  for (const prayer of prayers) {
    // Remove timezone strings like " (EEST)" if AlAdhan returns them
    const cleanTime = prayer.time.split(' ')[0];
    const [hours, minutes] = cleanTime.split(':').map(Number);

    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Only schedule if the time is in the future for today
    if (scheduledDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer.label} Vakti`,
          body: `${city.toLocaleUpperCase('tr-TR')} için ${prayer.label} vakti girdi.`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
        },
      });
    }
  }
}