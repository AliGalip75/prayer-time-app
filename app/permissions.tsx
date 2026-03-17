// app/permissions.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAppStore } from '@/store/appStorage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BellRing } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function Permissions() {
  const router = useRouter();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const insets = useSafeAreaInsets();

  const handleRequestPermission = async () => {
    // Request permission from the OS
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Bilgi', 'Bildirim izni vermediğiniz için vakitlerde uyarı alamayacaksınız. Bunu daha sonra ayarlardan açabilirsiniz.');
    }

    // Mark onboarding as complete and go to main screen
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    // Mark onboarding as complete and go to main screen
    completeOnboarding();
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-neutral-950 justify-center px-6" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      
      <View className="items-center mb-12">
        <View className="bg-neutral-900 p-6 rounded-full mb-6">
          <BellRing size={64} color="#10B981" />
        </View>
        <Text className="text-white text-3xl font-extrabold mb-4 text-center">Bildirimleri Açın</Text>
        <Text className="text-gray-400 text-center text-base leading-6">
          Ezan vakitlerini ve hatırlatmaları kaçırmamak için uygulamaya bildirim izni verin.
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleRequestPermission}
        className="bg-[#10B981] py-4 rounded-2xl items-center mb-4"
      >
        <Text className="text-white font-bold text-lg">İzin Ver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSkip}
        className="py-4 items-center"
      >
        <Text className="text-gray-500 font-medium text-base">Şimdilik Geç</Text>
      </TouchableOpacity>
    </View>
  );
}