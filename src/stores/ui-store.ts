import { create } from 'zustand';
import type { Locale } from '@/i18n/config';
import { defaultLocale } from '@/i18n/config';

interface UIState {
  sidebarOpen: boolean;
  locale: Locale;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLocale: (locale: Locale) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  locale: defaultLocale,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLocale: (locale) => set({ locale }),
}));
