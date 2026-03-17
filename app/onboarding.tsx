// app/onboarding.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/appStorage'; // Kendi yoluna göre kontrol et
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ChevronRight } from 'lucide-react-native';

// Türkiye'nin 81 ili (Alfabetik sırayla)
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

// Türkçe karakter sorununu çözen arama filtresi
const normalizeString = (str: string) => {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase();
};

export default function Onboarding() {
  const router = useRouter();
  const setCity = useAppStore((state) => state.setCity);
  const insets = useSafeAreaInsets();
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleCitySelect = (city: string) => {
    setCity(city);
    router.replace('/permissions'); 
    };

  // Arama metnine göre şehirleri filtrele
  const filteredCities = ALL_CITIES.filter((city) => 
    normalizeString(city).includes(normalizeString(searchQuery))
  );

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />
      
      <View className="flex-1 px-5 pt-8">
        {/* Üst Başlık */}
        <View className="mb-6">
          <Text className="text-white text-3xl font-extrabold mb-2">Hoş Geldiniz</Text>
          <Text className="text-gray-400 text-base leading-6">
            Size en doğru ezan vakitlerini gösterebilmemiz için lütfen bulunduğunuz şehri seçin veya arayın.
          </Text>
        </View>

        {/* Arama Kutusu (Büyük ve Okunaklı) */}
        <View className="flex-row items-center bg-neutral-900 rounded-2xl px-3 py-3 mb-6 border border-neutral-800">
          <Search color="#94A3B8" size={24} />
          <TextInput
            className="flex-1 ml-3 text-white text-lg"
            placeholder="Şehir Ara... (Örn: Konya)"
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
        </View>

        {/* Şehir Listesi */}
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          // Klavye açıkken listeyi kaydırınca klavyeyi kapat
          keyboardDismissMode="on-drag" 
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleCitySelect(item)}
              activeOpacity={0.7}
              className="bg-neutral-900 py-5 px-5 rounded-2xl mb-3 flex-row justify-between items-center border border-neutral-800/50"
            >
              <Text className="text-white text-xl font-medium">{item}</Text>
              <ChevronRight color="#10B981" size={24} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View className="py-10 items-center">
              <Text className="text-gray-500 text-lg">Böyle bir şehir bulunamadı.</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </View>
  );
}