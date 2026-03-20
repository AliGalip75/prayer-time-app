import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useImportantDays } from '@/hooks/useImportantDays';

export default function ImportantDaysScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Fetch data via custom hook
  const { days, loading } = useImportantDays();

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Önemli Günler</Text>
      </View>

      {/* Loading State */}
      {loading && days.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="bg-neutral-900 p-5 rounded-3xl mb-4 border border-neutral-800/50">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-vakit-accent font-bold text-lg flex-1 mr-2">
                  {item.name}
                </Text>
                <View className="bg-neutral-800 px-3 py-1 rounded-full">
                  <Text className="text-vakit-text text-xs font-medium">{item.day}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                <Text className="text-vakit-text ml-2 font-medium">
                  {item.date}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}