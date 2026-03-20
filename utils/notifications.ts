import notifee, { 
  TriggerType, 
  TimestampTrigger, 
  AndroidImportance, 
  AndroidVisibility,
  AndroidStyle 
} from '@notifee/react-native';

export async function schedulePrayerNotifications(monthlyData: any[], city: string) {
  // Clear previous notifications
  await notifee.cancelAllNotifications();

  if (!monthlyData || !city || !Array.isArray(monthlyData)) return;

  // Create notification channel
  const channelId = await notifee.createChannel({
    id: 'prayer-alerts-v2',
    name: 'Namaz Vakitleri',
    importance: AndroidImportance.HIGH, // Makes the notification appear at the top
    visibility: AndroidVisibility.PUBLIC, // Shows content on lock screen
    sound: 'default', // Custom ezan sound can be added later (raw)
  });

  const now = new Date();
  const todayIndex = now.getDate() - 1;
  const daysToSchedule = monthlyData.slice(todayIndex, todayIndex + 7);

  for (const dailyData of daysToSchedule) {
    if (!dailyData || !dailyData.date || !dailyData.timings) continue;

    const dateStr = dailyData.date.gregorian.date;
    const [day, month, year] = dateStr.split('-').map(Number);

    const prayers = [
      { id: '1', label: 'İmsak', time: dailyData.timings.Imsak, color: '#1E293B' }, // Lacivert
      { id: '2', label: 'Güneş', time: dailyData.timings.Sunrise, color: '#F59E0B' }, // Turuncu
      { id: '3', label: 'Öğle', time: dailyData.timings.Dhuhr, color: '#10B981' }, // Yeşil
      { id: '4', label: 'İkindi', time: dailyData.timings.Asr, color: '#10B981' },
      { id: '5', label: 'Akşam', time: dailyData.timings.Maghrib, color: '#F43F5E' }, // Gül/Kırmızı
      { id: '6', label: 'Yatsı', time: dailyData.timings.Isha, color: '#4F46E5' }, // İndigo
    ];

    for (const prayer of prayers) {
      const cleanTime = prayer.time.split(' ')[0];
      const [hours, minutes] = cleanTime.split(':').map(Number);

      // The absolute date object for the prayer time
      const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

      if (scheduledDate > now) {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: scheduledDate.getTime(),
        };

        // Schedule the notification
        await notifee.createTriggerNotification(
        {
          id: `test-${Date.now()}`,
          title: `🕋 ${prayer.label} Vakti`,
          body: `${city} - ${prayer.label} vakti girdi.`,
          android: {
            channelId,
            color: '#10B981', 
            largeIcon: require('../assets/images/prayer_rug.jpeg'),
            // What to do when the notification is pressed
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            
            style: { 
              type: AndroidStyle.BIGPICTURE, 
              picture: require('../assets/images/prayer_rug.jpeg'), 
            },
          },
        },
        trigger
      );
      }
    }
  }
}