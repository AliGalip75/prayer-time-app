// app/esma.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ESMA_UL_HUSNA } from '@/constants/esmaData';

export default function EsmaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header section with back button */}
      <View className="flex-row items-center px-5 py-4 border-b border-neutral-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Esma-ül Hüsna</Text>
      </View>

      {/* List of names */}
      <FlatList
        data={ESMA_UL_HUSNA}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <View className="bg-neutral-900 p-5 rounded-2xl mb-4 flex-row items-center">
            {/* Number indicator */}
            <View className="bg-neutral-800 w-10 h-10 rounded-full items-center justify-center mr-4">
              <Text className="text-vakit-accent font-bold">{index + 1}</Text>
            </View>
            
            {/* Turkish name and meaning */}
            <View className="flex-1">
              <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
              <Text className="text-gray-400 text-sm">{item.meaning}</Text>
            </View>
            
            {/* Arabic text */}
            <Text className="text-vakit-accent text-2xl font-bold ml-2">{item.arabic}</Text>
          </View>
        )}
      />
    </View>
  );
}