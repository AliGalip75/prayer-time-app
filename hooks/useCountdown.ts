// hooks/useCountdown.ts
import { useState, useEffect } from 'react';

export const useCountdown = (timings: any) => {
  const [countdown, setCountdown] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [nextPrayerLabel, setNextPrayerLabel] = useState('...');
  const [activePrayerId, setActivePrayerId] = useState('1');

  useEffect(() => {
    if (!timings) return;

    // Clean up timing strings (AlAdhan sometimes adds " (EEST)" at the end)
    const cleanTime = (timeStr: string) => timeStr.split(' ')[0];

    const prayerList = [
      { id: '1', label: 'İmsak', time: cleanTime(timings.Imsak) },
      { id: '2', label: 'Güneş', time: cleanTime(timings.Sunrise) },
      { id: '3', label: 'Öğle', time: cleanTime(timings.Dhuhr) },
      { id: '4', label: 'İkindi', time: cleanTime(timings.Asr) },
      { id: '5', label: 'Akşam', time: cleanTime(timings.Maghrib) },
      { id: '6', label: 'Yatsı', time: cleanTime(timings.Isha) },
    ];

    const updateTimer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds();

      let nextPrayer = null;
      let activeId = '6'; // Default to Yatsı if we are past all prayers

      // Find the next upcoming prayer
      for (let i = 0; i < prayerList.length; i++) {
        const [hours, minutes] = prayerList[i].time.split(':').map(Number);
        const prayerTimeInSeconds = hours * 60 * 60 + minutes * 60;

        if (prayerTimeInSeconds > currentTime) {
          nextPrayer = prayerList[i];
          // The active prayer is the previous one (if next is Imsak, active is Yatsı)
          activeId = i === 0 ? '6' : prayerList[i - 1].id; 
          break;
        }
      }

      let timeDiff = 0;

      if (nextPrayer) {
        const [hours, minutes] = nextPrayer.time.split(':').map(Number);
        const nextTimeInSeconds = hours * 60 * 60 + minutes * 60;
        timeDiff = nextTimeInSeconds - currentTime;
        setNextPrayerLabel(`${nextPrayer.label} vaktine kalan`);
      } else {
        // If no next prayer today, it means next is tomorrow's Imsak
        const [hours, minutes] = prayerList[0].time.split(':').map(Number);
        const nextTimeInSeconds = (hours + 24) * 60 * 60 + minutes * 60;
        timeDiff = nextTimeInSeconds - currentTime;
        setNextPrayerLabel('İmsak vaktine kalan');
        activeId = '6'; // Yatsı is active
      }

      setActivePrayerId(activeId);

      // Calculate formatting
      const h = Math.floor(timeDiff / 3600);
      const m = Math.floor((timeDiff % 3600) / 60);
      const s = timeDiff % 60;

      setCountdown({
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0'),
      });
    };

    // Run immediately, then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [timings]);

  return { ...countdown, nextPrayerLabel, activePrayerId };
};