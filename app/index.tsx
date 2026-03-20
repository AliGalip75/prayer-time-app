// app/index.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloudMoon, MoonStar } from 'lucide-react-native';
import { DAILY_CONTENT } from '@/constants/dailyContent';


// Hooks
import { useTimings } from '@/hooks/useTimings';
import { useAppStore } from '@/store/appStorage';
import { useCountdown } from '@/hooks/useCountdown';

const MENU_ITEMS = [
  { id: '1', title: "Ayarlar", icon: 'settings-outline', route: '/settings' },
  { id: '2', title: 'Esma-ul Husna', icon: 'moon-outline', route: '/esma' },
  { id: '3', title: 'Namaz Takibi', icon: 'checkmark-circle-outline', route: '/takip' },
  { id: '4', title: 'Önemli Günler', icon: 'calendar-outline', route: '/importantDaysScreen' },
  { id: '5', title: 'Kıble', icon: 'compass-outline', route: '/qiblaScreen' },
  { id: '6', title: 'Zekat Hesabı', icon: 'calculator-outline', route: '/zekat' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Get city from Zustand and fetch data
  const city = useAppStore((state) => state.city);
  const { timingsData, loading } = useTimings();

  // Get today's index (Date starts from 1, array index starts from 0)
  const todayIndex = new Date().getDate() - 1;
  const tomorrowIndex = todayIndex + 1;
  
  // Extract today's timings from the monthly array
  const todayTimings = timingsData ? timingsData[todayIndex]?.timings : null;
  const tomorrowTimings = timingsData ? timingsData[tomorrowIndex]?.timings : null;

  const { hours, minutes, seconds, nextPrayerLabel, activePrayerId } = useCountdown(todayTimings, tomorrowTimings);
  // Map API data to our UI structure
  const getDynamicPrayerTimes = () => {
    if (!todayTimings) return [];
    const t = todayTimings;
    
    // Helper function to remove timezone string like " (+03)" or " (EEST)"
    const cleanTime = (timeStr: string) => timeStr ? timeStr.split(' ')[0] : '--:--';
    
    // 3. Map active status with activePrayerId
    return [
      { id: '1', label: 'İmsak', time: cleanTime(t.Imsak), expoIcon: 'moon-outline', isActive: activePrayerId === '1' },
      { id: '2', label: 'Güneş', time: cleanTime(t.Sunrise), expoIcon: 'sunny-outline', isActive: activePrayerId === '2' },
      { id: '3', label: 'Öğle', time: cleanTime(t.Dhuhr), expoIcon: 'sunny', isActive: activePrayerId === '3' },
      { id: '4', label: 'İkindi', time: cleanTime(t.Asr), expoIcon: 'partly-sunny-outline', isActive: activePrayerId === '4' },
      { id: '5', label: 'Akşam', time: cleanTime(t.Maghrib), LucideIcon: CloudMoon, isActive: activePrayerId === '5' },
      { id: '6', label: 'Yatsı', time: cleanTime(t.Isha), LucideIcon: MoonStar, isActive: activePrayerId === '6' },
    ];
  };
  
  const dynamicTimes = getDynamicPrayerTimes();

  // Show loading screen while fetching data
  if (loading || !timingsData) {
    return (
      <View className="flex-1 bg-neutral-950 justify-center items-center">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  };

  // Content - (Ayın gününe göre içerik seç)(1-31)
  const today = new Date().getDate(); 
  // Dizinin boyutuna göre mod alıyoruz ki index dışına çıkmayalım
  const contentOfTheDay = DAILY_CONTENT[(today - 1) % DAILY_CONTENT.length];

  // Extract dates from API response
  const gregorianDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
        <StatusBar style="light" />
        
        {/* SECTION 1: Top Area */}
        <View className="bg-neutral-900 rounded-b-[40px] px-5 pt-4 pb-6">
        
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Ionicons name="location-sharp" size={24} color="#94A3B8" />
                    <View className="ml-2">
                        <Text className="text-white font-bold text-md tracking-wider pr-20">{city?.toLocaleUpperCase('tr-TR')}</Text>
                        <Text className="text-vakit-muted text-xs">Türkiye</Text>
                    </View>
                </View>
                <View className="items-end h-full">
                    <Text className="text-vakit-muted text-s">{gregorianDate}</Text>
                </View>
            </View>

            {/* Countdown */}
            <View className="items-center mt-4">
                <Text className="text-gray-300 text-md mb-3">{nextPrayerLabel}</Text>
                <View className="flex-row items-center justify-center">
                    <View className="bg-vakit-accent px-4 py-3 rounded-xl mx-1">
                        <Text className="text-white text-4xl font-bold">{hours}</Text>
                    </View> 
                    <Text className="text-vakit-text text-3xl mb-1">:</Text>
                    <View className="bg-vakit-accent px-4 py-3 rounded-xl mx-1">
                        <Text className="text-white text-4xl font-bold">{minutes}</Text>
                    </View>
                    <Text className="text-vakit-text text-3xl mb-1">:</Text>
                    <View className="bg-vakit-accent px-4 py-3 rounded-xl mx-1">
                        <Text className="text-white text-4xl font-bold">{seconds}</Text>
                    </View>
                </View>
            </View>

            {/* Times Row (Dynamic) */}
            <View className="flex-row justify-between items-center mt-8 px-1">
            {dynamicTimes.map((item) => {
                const LIcon = item.LucideIcon;

                return (
                <View 
                    key={item.id} 
                    // FIXED: Added overflow-hidden to force rounded corners, and px-1 for safety
                    className={`items-center py-2 px-1 rounded-xl overflow-hidden ${item.isActive ? 'bg-neutral-700/90 w-14' : 'w-14'}`}
                >
                    {/* Render LucideIcon if it exists, otherwise fallback to Ionicons */}
                    {LIcon ? (
                        <LIcon 
                            size={16} 
                            color={item.isActive ? 'white' : '#94A3B8'} 
                        />
                    ) : (
                        <Ionicons 
                            name={item.expoIcon as any} 
                            size={16} 
                            color={item.isActive ? 'white' : '#94A3B8'} 
                        />
                    )}
                    
                    {/* FIXED: Changed text-s to text-xs to prevent NativeWind parser errors */}
                    <Text className={`text-xs mt-1 ${item.isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                        {item.label}
                    </Text>
                    
                    <Text className="text-sm font-semibold mt-1 text-vakit-text">
                        {item.time}
                    </Text>
                </View>
                );
            })}
            </View>
        </View>

        {/* SECTION 2: Middle Area (Daily Content) */}
        <View className="mt-6 border border-neutral-800 mx-5 rounded-2xl">
          <View className="bg-neutral-900 rounded-2xl p-5">
            {/* Dinamik Arapça Metin */}
            <Text className="text-white text-right text-2xl mb-4 leading-10 font-bold">
              {contentOfTheDay.arabic}
            </Text>
            {/* Dinamik Türkçe Anlam */}
            <Text className="text-vakit-muted text-md italic mb-4 leading-6">
              {contentOfTheDay.turkish}
            </Text>
            {/* Dinamik Kaynak */}
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-vakit-accent text-sm font-medium">{contentOfTheDay.source}</Text>
              <Text className="text-vakit-accent text-sm font-medium ml-1">{'>'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3: Bottom Area */}
        <View className="px-5 mt-6 pb-10">
            <View className="flex-row flex-wrap justify-between">
                {MENU_ITEMS.map((item) => (
                    <TouchableOpacity 
                    key={item.id}
                    onPress={() => router.push(item.route as any)}
                    className="bg-neutral-900 w-[31%] aspect-square rounded-2xl items-center justify-center mb-4"
                    >
                        <Ionicons name={item.icon as any} size={28} color="#10B981" />
                        <Text className="text-gray-300 text-xs font-medium mt-3 text-center px-1">
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

    </View>
  );
}