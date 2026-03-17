import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Svg, Circle, Line, Path, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.82;
const NEEDLE_LENGTH = COMPASS_SIZE * 0.38;

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calcQiblaAngle(lat: number, lng: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LNG - lng) * Math.PI) / 180;
  const y = Math.sin(Δλ);
  const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getMagnetometerAngle(mag: { x: number; y: number; z: number }): number {
  return (Math.atan2(mag.y, mag.x) * (180 / Math.PI) + 360) % 360;
}

export default function QiblaScreen() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aligned, setAligned] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevHeading = useRef(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Hizalanma animasyonu
  useEffect(() => {
    if (aligned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [aligned]);

  // Konum al
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Konum izni reddedildi');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const lat = loc.coords.latitude;
        const lng = loc.coords.longitude;
        setLocation({ lat, lng });
        setQiblaAngle(calcQiblaAngle(lat, lng));
        setLoading(false);
      } catch {
        setError('Konum alınamadı');
        setLoading(false);
      }
    })();
  }, []);

  // Pusula (manyetometre)
  useEffect(() => {
    const sub = Magnetometer.addListener((data) => {
      const angle = getMagnetometerAngle(data);
      setHeading(angle);

      let diff = angle - prevHeading.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const newVal = prevHeading.current + diff;
      prevHeading.current = newVal;

      Animated.timing(rotateAnim, {
        toValue: newVal,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    Magnetometer.setUpdateInterval(100);
    return () => sub.remove();
  }, []);

  // Hizalanma kontrolü
  useEffect(() => {
    if (qiblaAngle === null) return;
    const needleDir = (qiblaAngle - heading + 360) % 360;
    setAligned(needleDir < 5 || needleDir > 355);
  }, [heading, qiblaAngle]);

  const rotateStyle = {
    transform: [
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-360, 0, 360, 720],
          outputRange: ['-360deg', '0deg', '360deg', '720deg'],
        }),
      },
    ],
  };

  const qiblaNeedle = qiblaAngle !== null ? (qiblaAngle - heading + 360) % 360 : 0;
  const R = COMPASS_SIZE / 2;
  const cx = R;
  const cy = R;

  function needlePoint(angleDeg: number, len: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) };
  }

  const qiblaFront = needlePoint(qiblaNeedle, NEEDLE_LENGTH);
  const qiblaBack = needlePoint(qiblaNeedle + 180, NEEDLE_LENGTH * 0.35);

  return (
    
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header section with back button */}
      <View className="flex-row w-full items-center px-5 py-4 border-b border-neutral-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Kıble Yönü</Text>
      </View>

      {/* Başlık */}
      <View className="items-center my-8">
        <Text className="text-[#E8E4D0] text-2xl font-bold tracking-widest">
          Kıble Yönü
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center gap-4">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-vakit-text text-base mt-3">Konum alınıyor…</Text>
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-[#E74C3C] text-4xl">⚠</Text>
          <Text className="text-[#8892AA] text-base text-center">{error}</Text>
          <TouchableOpacity
            className="mt-2 px-6 py-2.5 rounded-full border border-[#C9A84C] bg-[#C9A84C]/10"
            onPress={() => {}}
          >
            <Text className="text-[#C9A84C] font-semibold text-sm">Tekrar Dene</Text>
          </TouchableOpacity>
        </View>

      ) : (
        <>
          {/* Pusula kapsayıcısı — dinamik boyutlar style prop ile verilir */}
          <View
            className="items-center justify-center relative"
            style={{ width: COMPASS_SIZE + 70, height: COMPASS_SIZE + 70 }}
          >
            {/* Hizalanma halkası */}
            <Animated.View
              className="absolute border-[3px] border-[#C9A84C]"
              style={{
                width: COMPASS_SIZE + 18,
                height: COMPASS_SIZE + 18,
                borderRadius: (COMPASS_SIZE + 18) / 2,
                opacity: aligned ? glowAnim : 0,
              }}
            />

            {/* Dönen kadran */}
            <Animated.View
              className="absolute"
              style={[{ width: COMPASS_SIZE, height: COMPASS_SIZE }, rotateStyle]}
            >
              <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
                <Circle cx={cx} cy={cy} r={R - 4} fill="#171717" stroke="#10B981" strokeWidth={1.5} />

                {Array.from({ length: 72 }, (_, i) => {
                  const deg = i * 5;
                  const isMain = deg % 90 === 0;
                  const isMid = deg % 45 === 0;
                  const rad = ((deg - 90) * Math.PI) / 180;
                  const outer = R - 6;
                  const inner = isMain ? R - 22 : isMid ? R - 18 : R - 14;
                  return (
                    <Line
                      key={deg}
                      x1={cx + outer * Math.cos(rad)}
                      y1={cy + outer * Math.sin(rad)}
                      x2={cx + inner * Math.cos(rad)}
                      y2={cy + inner * Math.sin(rad)}
                      stroke={isMain ? '#C9A84C' : isMid ? '#6B6B8A' : '#3A3A5A'}
                      strokeWidth={isMain ? 2 : 1}
                    />
                  );
                })}

                {[
                  { label: 'K', deg: 0, color: '#E74C3C' },
                  { label: 'G', deg: 180, color: '#C9A84C' },
                  { label: 'D', deg: 90, color: '#8892AA' },
                  { label: 'B', deg: 270, color: '#8892AA' },
                ].map(({ label, deg, color }) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  const r2 = R - 32;
                  return (
                    <SvgText
                      key={label}
                      x={cx + r2 * Math.cos(rad)}
                      y={cy + r2 * Math.sin(rad) + 5}
                      textAnchor="middle"
                      fill={color}
                      fontSize={16}
                      fontWeight="700"
                    >
                      {label}
                    </SvgText>
                  );
                })}

                <Circle cx={cx} cy={cy} r={R * 0.55} fill="none" stroke="#10B981" strokeWidth={1} />
               
              </Svg>
            </Animated.View>

            {/* Kıble ibresi */}
            <View
              className="absolute z-10"
              style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}
            >
              <Svg width={COMPASS_SIZE} height={COMPASS_SIZE}>
                <Line
                  x1={cx} y1={cy} x2={qiblaFront.x} y2={qiblaFront.y}
                  stroke="#00000060" strokeWidth={5} strokeLinecap="round"
                />
                <Line
                  x1={cx} y1={cy} x2={qiblaBack.x} y2={qiblaBack.y}
                  stroke="#4A4A6A" strokeWidth={4} strokeLinecap="round"
                />
                <Line
                  x1={cx} y1={cy} x2={qiblaFront.x} y2={qiblaFront.y}
                  stroke="#C9A84C" strokeWidth={3} strokeLinecap="round"
                />
                <G transform={`translate(${qiblaFront.x - 10}, ${qiblaFront.y - 10})`}>
                  <Path
                    d="M10 2 L18 6 L18 18 L10 22 L2 18 L2 6 Z"
                    fill={aligned ? '#C9A84C' : '#8B7335'}
                    stroke={aligned ? '#FFD700' : '#C9A84C'}
                    strokeWidth={1}
                  />
                  <SvgText x={10} y={14} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
                    ك
                  </SvgText>
                </G>
                <Circle cx={cx} cy={cy} r={7} fill="#1A1A2E" stroke="#C9A84C" strokeWidth={2} />
                <Circle cx={cx} cy={cy} r={3} fill="#C9A84C" />
              </Svg>
            </View>
          </View>

          {/* Bilgi kartı */}
          <View className="bg-neutral-900 rounded-2xl p-5 mx-5 mt-7">
            <View className="flex-row items-center justify-around">
              <View className="flex-1 items-center">
                <Text className="text-vakit-muted text-xs tracking-widest uppercase mb-1.5">
                  Kıble Açısı
                </Text>
                <Text className="text-vakit-text text-lg font-bold">
                  {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '—'}
                </Text>
              </View>

              <View className="w-px h-9 bg-vakit-muted" />

              <View className="flex-1 items-center">
                <Text className="text-vakit-muted text-xs tracking-widest uppercase mb-1.5">
                  Konum
                </Text>
                <Text className="text-vakit-text text-lg font-bold">
                  {location
                    ? `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`
                    : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Durum badge */}
          <View
            className={`mt-5 mx-5 items-center py-3 rounded-3xl ${
              aligned
                ? 'bg-neutral-900/10'
                : 'bg-neutral-900'
            }`}
          >
            <Text
              className={`text-sm font-semibold tracking-wide ${
                aligned ? 'text-vakit-text' : 'text-vakit-text'
              }`}
            >
              {aligned ? '✦  Kıble Yönündesiniz  ✦' : 'Cihazı Kıble Yönüne Çevirin'}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}