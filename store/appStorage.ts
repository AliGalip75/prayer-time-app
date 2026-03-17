// /store/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

// Helper for Zustand to use MMKV
const zustandStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => storage.remove(name),
};

interface AppState {
  city: string | null;
  hasCompletedOnboarding: boolean;
  setCity: (city: string) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      city: null, // Başlangıçta şehir seçilmemiş
      hasCompletedOnboarding: false, // Onboarding tamamlanmamış
      setCity: (city) => set({ city }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'vakit-store',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);