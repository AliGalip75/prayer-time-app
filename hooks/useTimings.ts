// hooks/useTimings.ts
import { useState, useEffect } from 'react';
import { fetchPrayerTimes } from '@/api/aladhan';
import { useAppStore, storage } from '@/store/appStorage';
// Import the notification scheduler
import { schedulePrayerNotifications } from '@/utils/notifications';

export const useTimings = () => {
  const city = useAppStore((state) => state.city);
  const [timingsData, setTimingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTimings = async () => {
      if (!city) return;
      
      setLoading(true);
      
      // Create a unique cache key for today and the selected city
      const today = new Date().toDateString();
      const cacheKey = `timings_${city}_${today}`;
      
      // Check local storage for cached data
      const cachedData = storage.getString(cacheKey);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTimingsData(parsedData);
        // Schedule notifications using cached data
        schedulePrayerNotifications(parsedData.timings, city);
        setLoading(false);
        return;
      }

      // Fetch from API if cache is empty
      const data = await fetchPrayerTimes(city);
      if (data) {
        setTimingsData(data);
        // Save to MMKV cache
        storage.set(cacheKey, JSON.stringify(data));
        // Schedule notifications using fresh data
        schedulePrayerNotifications(data.timings, city);
      }
      setLoading(false);
    };

    getTimings();
  }, [city]);

  return { timingsData, loading };
};