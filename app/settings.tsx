// app/ayarlar.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Modal, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Search, ChevronRight, X } from 'lucide-react-native';
import { useAppStore } from '@/store/appStorage';

// Array of 81 cities in Turkey
const ALL_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 
  'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

// Helper to fix Turkish character issues during search
const normalizeString = (str: string) => {
  return str.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
};

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const currentCity = useAppStore((state) => state.city);
  const setCity = useAppStore((state) => state.setCity);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((state) => state.setNotificationsEnabled);

  const handleCitySelect = (city: string) => {
    if (city !== currentCity) {
      setCity(city);
    }
    // Close modal and reset search input
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const filteredCities = ALL_CITIES.filter((city) => 
    normalizeString(city).includes(normalizeString(searchQuery))
  );

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Main Settings Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Ayarlar</Text>
      </View>

      {/* Settings Options List */}
      <View className="px-5 pt-6 flex-1">
        
        {/* City Change Button */}
        <TouchableOpacity 
          onPress={() => setIsModalVisible(true)}
          className="bg-neutral-900 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-800/50 mb-4"
        >
          <View className="flex-row items-center">
            <View className="bg-neutral-800 p-2 rounded-xl mr-3">
              <Ionicons name="location-outline" size={20} color="#10B981" />
            </View>
            <View>
              <Text className="text-white text-base font-medium">Şehir Değiştir</Text>
              <Text className="text-gray-400 text-sm mt-0.5">{currentCity}</Text>
            </View>
          </View>
          <ChevronRight color="#64748B" size={20} />
        </TouchableOpacity>

        {/* Notifications Toggle */}
        <View className="bg-neutral-900 p-4 rounded-2xl flex-row items-center justify-between border border-neutral-800/50 mb-4">
          <View className="flex-row items-center">
            <View className="bg-neutral-800 p-2 rounded-xl mr-3">
              <Ionicons name="notifications-outline" size={20} color="#10B981" />
            </View>
            <View>
              <Text className="text-white text-base font-medium">Bildirimler</Text>
              <Text className="text-gray-400 text-sm mt-0.5">Ezan vakti hatırlatıcıları</Text>
            </View>
          </View>
          <Switch 
            trackColor={{ false: "#334155", true: "#059669" }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#334155"
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              // Show custom toast message
              setToastMessage(value ? "Bildirimler açıldı" : "Bildirimler kapatıldı");
              // Hide it after 2.5 seconds
              setTimeout(() => setToastMessage(null), 2500);
            }}
            value={notificationsEnabled ?? true}
          />
        </View>

        {/* App Info */}
        <View className="mt-auto mb-10 items-center">
          <Text className="text-gray-600 text-sm font-medium">Vakit App v1.0.0</Text>
        </View>

      </View>

      {/* City Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-neutral-950 mt-12 rounded-t-3xl border-t border-neutral-800"
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-neutral-900">
            <Text className="text-white text-lg font-bold">Şehir Seçin</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-1">
              <X color="#94A3B8" size={24} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-5 pt-4">
            {/* Search Input */}
            <View className="flex-row items-center bg-neutral-900 rounded-2xl px-3 py-3 mb-4 border border-neutral-800">
              <Search color="#94A3B8" size={20} />
              <TextInput
                className="flex-1 ml-3 text-white text-base"
                placeholder="Şehir Ara..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>

            {/* City List */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCitySelect(item)}
                  activeOpacity={0.7}
                  className={`py-4 px-4 rounded-xl mb-2 flex-row justify-between items-center border ${
                    currentCity === item 
                      ? 'bg-vakit-accent/10 border-vakit-accent/50' 
                      : 'bg-neutral-900 border-neutral-800/50'
                  }`}
                >
                  <Text className={`text-lg font-medium ${currentCity === item ? 'text-vakit-accent' : 'text-white'}`}>
                    {item}
                  </Text>
                  {currentCity === item && (
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View className="py-10 items-center">
                  <Text className="text-gray-500 text-base">Böyle bir şehir bulunamadı.</Text>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <View className="absolute bottom-12 self-center bg-neutral-800/90 px-6 py-3 rounded-full border border-neutral-700 flex-row items-center shadow-lg z-50">
          <Ionicons 
            name={notificationsEnabled ? "notifications" : "notifications-off"} 
            size={18} 
            color={notificationsEnabled ? "#10B981" : "#94A3B8"} 
          />
          <Text className="text-white ml-2 font-medium">{toastMessage}</Text>
        </View>
      )}

    </View>
  );
}