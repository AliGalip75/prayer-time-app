// hooks/useTimings.ts
import { useState, useEffect } from 'react';
import { fetchPrayerTimes } from '@/api/aladhan';
import { useAppStore, storage } from '@/store/appStorage';
import { schedulePrayerNotifications } from '@/utils/notifications';
import * as Notifications from 'expo-notifications'; // 1. EKLENEN KISIM

export const useTimings = () => {
  const city = useAppStore((state) => state.city);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  
  const [timingsData, setTimingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTimings = async () => {
      if (!city) return;
      setLoading(true);
      
      const date = new Date();
      const monthYear = `${date.getMonth() + 1}_${date.getFullYear()}`;
      const cacheKey = `timings_monthly_${city}_${monthYear}`;
      
      let dataToUse = null;
      const cachedData = storage.getString(cacheKey);
      
      if (cachedData) {
        dataToUse = JSON.parse(cachedData);
        setTimingsData(dataToUse);
      } else {
        const data = await fetchPrayerTimes(city);
        if (data) {
          dataToUse = data;
          setTimingsData(dataToUse);
          storage.set(cacheKey, JSON.stringify(data));
        }
      }

      // 2. EKLENEN KISIM: Bildirim Şalteri Kontrolü
      if (dataToUse) {
        if (notificationsEnabled) {
          schedulePrayerNotifications(dataToUse, city);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
      }
      
      setLoading(false);
    };

    getTimings();
  // 3. EKLENEN KISIM: notificationsEnabled buraya eklendi
  }, [city, notificationsEnabled]); 

  return { timingsData, loading };
};