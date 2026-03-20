import { useState, useEffect } from 'react';
import { storage } from '@/store/appStorage';

export const useImportantDays = () => {
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDays = async () => {
      // Check local cache first for offline support
      const cachedDays = storage.getString('important_days_cache');
      if (cachedDays) {
        setDays(JSON.parse(cachedDays));
        setLoading(false);
      }

      // Fetch fresh data from GitHub in the background
      try {
        // REPLACE THIS URL WITH YOUR ACTUAL GITHUB RAW URL
        const response = await fetch('https://raw.githubusercontent.com/AliGalip75/prayer-app-data/refs/heads/main/holidays.json');
        if (response.ok) {
          const data = await response.json();
          setDays(data);
          // Update local cache with fresh data
          storage.set('important_days_cache', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Failed to fetch holidays from GitHub', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDays();
  }, []);

  return { days, loading };
};