import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "@/global.css";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '@/store/appStorage';
import * as Notifications from 'expo-notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  // Get state from store
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  // Track if store is loaded (Hydration)
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist data to load
    useAppStore.persist.onFinishHydration(() => setIsStoreLoaded(true));
    // If data is already loaded, update the state
    if (useAppStore.persist.hasHydrated()) {
      setIsStoreLoaded(true);
    }
    // System navigation bar settings only apply to Android
    if (Platform.OS === 'android') {
      // Hide the navigation bar completely
      NavigationBar.setVisibilityAsync('hidden');
      // Make it reappear only when swiping up from the bottom edge
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
    // Android için bildirim kanalı oluşturma
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Namaz Vakitleri',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    }
  }, []);

  useEffect(() => {
    if (!isStoreLoaded) return; // Store yüklenmeden işlem yapma

    const inAuthGroup = segments[0] === 'onboarding' || segments[0] === 'permissions';

    // Kullanıcı onboarding'i tamamlamadıysa ve onboarding sayfasında değilse
    if (!hasCompletedOnboarding && !inAuthGroup) {
      router.replace('/onboarding');
    } 
    // Kullanıcı onboarding'i tamamladıysa ve onboarding sayfasındaysa
    else if (hasCompletedOnboarding && inAuthGroup) {
      router.replace('/');
    }

  }, [hasCompletedOnboarding, segments, isStoreLoaded]);

  // Store yüklenene kadar boş bir ekran göster (Splash screen gibi düşünebilirsin)
  if (!isStoreLoaded) {
    return null; 
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="qiblaScreen" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="permissions" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
