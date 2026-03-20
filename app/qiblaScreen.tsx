// app/kible.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.75;
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Matematiksel Kıble Açısı Hesaplama (Değiştirmedik, doğru çalışıyor)
function calcQiblaAngle(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function KibleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aligned, setAligned] = useState(false);

  // Animasyon Değerleri
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const prevHeading = useRef(0);

  // 1. Konum İzni ve Kıble Açısını Bulma
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Pusula için konum izni gerekiyor.');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        setQiblaAngle(calcQiblaAngle(loc.coords.latitude, loc.coords.longitude));
        setLoading(false);
      } catch (err) {
        setError('Konum alınamadı. Lütfen GPS\'i açın.');
        setLoading(false);
      }
    })();
  }, []);

  // 2. İşletim Sisteminin Filtrelenmiş Pusulasını Dinleme (Magnetometer yerine)
  useEffect(() => {
    let subscription: Location.LocationHeadingObject | any;
    
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subscription = await Location.watchHeadingAsync((headingData) => {
          // trueHeading (Gerçek Kuzey) veya magHeading (Manyetik Kuzey)
          const currentHeading = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
          
          // 360'dan 0'a geçerken pusulanın fırıldak gibi dönmesini engelleyen mantık
          let diff = currentHeading - prevHeading.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          const newVal = prevHeading.current + diff;
          prevHeading.current = newVal;

          Animated.timing(rotateAnim, {
            toValue: newVal,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }).start();
        });
      }
    })();

    return () => {
      if (subscription && subscription.remove) subscription.remove();
    };
  }, []);

  // 3. Kıbleye Hizalanma Kontrolü (Hassasiyet)
  useEffect(() => {
    if (qiblaAngle === null) return;
    // Cihazın baktığı yön ile kıble açısı arasındaki fark 3 dereceden azsa "Hizalandı" say
    const currentHeading = prevHeading.current % 360;
    const normalizedHeading = currentHeading < 0 ? currentHeading + 360 : currentHeading;
    
    const diff = Math.abs(normalizedHeading - qiblaAngle);
    const isAligned = diff < 3 || diff > 357; 
    setAligned(isAligned);
  }, [rotateAnim, qiblaAngle]);

  // Döndürme Stili (- rotate çünkü telefon dönerken kadran tersine dönmeli)
  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '-360deg'],
        }),
      },
    ],
  };

  // Kıble ibresinin kadrandaki dönüş açısı
  const qiblaNeedleStyle = {
    transform: [{ rotate: `${qiblaAngle || 0}deg` }]
  };

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Kıble Pusulası</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-400 mt-4">Kıble yönü hesaplanıyor...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="warning-outline" size={48} color="#EF4444" />
          <Text className="text-gray-400 mt-4 text-center">{error}</Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          
          {/* DURUM MESAJI */}
          <Text className={`text-2xl font-bold mb-10 tracking-widest ${aligned ? 'text-vakit-accent' : 'text-white'}`}>
            {aligned ? "KIBLEYE DÖNDÜNÜZ" : "CİHAZI ÇEVİRİN"}
          </Text>

          {/* PUSULA ANA KUTUSU */}
          <View className="items-center justify-center relative" style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}>
            
            {/* Dış Çerçeve ve Kuzey/Güney Harfleri (Dönen Kısım) */}
            <Animated.View className="absolute items-center justify-center w-full h-full" style={rotateStyle}>
              <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox="0 0 100 100">
                {/* Dış Halka */}
                <Circle cx="50" cy="50" r="48" stroke="#262626" strokeWidth="2" fill="none" />
                <Circle cx="50" cy="50" r="40" stroke="#171717" strokeWidth="8" fill="none" />
                
                {/* Kuzey Oku ve N harfi */}
                <Path d="M48 10 L50 4 L52 10 Z" fill="#EF4444" />
                <SvgText x="50" y="22" fill="#94A3B8" fontSize="10" fontWeight="bold" textAnchor="middle">N</SvgText>
                
                {/* E, S, W harfleri */}
                <SvgText x="85" y="53" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">E</SvgText>
                <SvgText x="50" y="85" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">S</SvgText>
                <SvgText x="15" y="53" fill="#64748B" fontSize="8" fontWeight="bold" textAnchor="middle">W</SvgText>
              </Svg>

              {/* KIBLE İBRESİ (Kadranın İçinde Sabit Kıble Açısına Bakan Ok) */}
              <View className="absolute w-full h-full items-center justify-center" style={qiblaNeedleStyle}>
                {/* İbrenin çubuğu */}
                <View className="w-1 h-32 bg-vakit-accent rounded-full absolute top-8" />
                {/* İbrenin başı (Kabe temsili elmas şekli) */}
                <View className="w-6 h-6 bg-vakit-accent absolute top-6" style={{ transform: [{ rotate: '45deg' }] }} />
              </View>
            </Animated.View>

            {/* Sabit Orta Nokta (Telefonun Merkezini Gösterir) */}
            <View className="w-4 h-4 bg-neutral-950 rounded-full border-2 border-white absolute z-10" />
          </View>

          {/* ALT BİLGİ KARTI */}
          <View className="bg-neutral-900 rounded-3xl p-6 mt-16 w-11/12 border border-neutral-800">
            <View className="flex-row justify-between items-center">
              <View className="items-center flex-1">
                <Text className="text-gray-500 text-xs font-bold tracking-widest mb-1">KIBLE AÇISI</Text>
                <Text className="text-white text-2xl font-bold">{Math.round(qiblaAngle || 0)}°</Text>
              </View>
              <View className="w-px h-10 bg-neutral-800" />
              <View className="items-center flex-1">
                <Text className="text-gray-500 text-xs font-bold tracking-widest mb-1">BULUNDUĞUNUZ ŞEHİR</Text>
                {/* İstersen buraya doğrudan Zustand'dan city statini çekip yazdırabilirsin */}
                <Text className="text-vakit-accent text-lg font-bold">TÜRKİYE</Text>
              </View>
            </View>
          </View>
          
        </View>
      )}
    </View>
  );
}