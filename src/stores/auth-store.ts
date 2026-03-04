import { create } from 'zustand';
import type { Profile, UserRole } from '@/types/database';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  hasRole: (roles: UserRole[]) => boolean;
  isCoachOrAbove: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  hasRole: (roles) => {
    const { profile } = get();
    if (!profile) return false;
    return roles.includes(profile.role);
  },
  isCoachOrAbove: () => {
    const { profile } = get();
    if (!profile) return false;
    return ['admin', 'club_manager', 'coach'].includes(profile.role);
  },
}));
