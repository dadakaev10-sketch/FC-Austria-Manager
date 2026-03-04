'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthChange } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/services';
import { clubsService, subscribeClubTeams } from '@/lib/firebase/services';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { isDemoMode, DEMO_PROFILE, DEMO_CLUB, DEMO_TEAMS, DEMO_PLAYERS, DEMO_PLAYER_TEAMS } from '@/lib/demo-data';
import { Loader2 } from 'lucide-react';
import type { Profile } from '@/types/database';

const AUTH_PAGES = ['/login', '/register'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setProfile, setLoading: setAuthLoading } = useAuthStore();
  const { setCurrentClub, setTeams, setPlayers, setPlayerTeams } = useClubStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // --- Demo Mode: skip Firebase, load mock data ---
    if (isDemoMode()) {
      setProfile(DEMO_PROFILE);
      setCurrentClub(DEMO_CLUB);
      setTeams(DEMO_TEAMS);
      setPlayers(DEMO_PLAYERS);
      setPlayerTeams(DEMO_PLAYER_TEAMS);
      setAuthLoading(false);
      setIsReady(true);
      return;
    }

    const unsubscribeAuth = onAuthChange(async (user) => {
      if (!user) {
        setProfile(null);
        setCurrentClub(null);
        setTeams([]);
        setPlayers([]);
        setPlayerTeams([]);
        setAuthLoading(false);
        setIsReady(true);

        // Redirect to login if not on an auth page
        if (!AUTH_PAGES.includes(pathname)) {
          router.push('/login');
        }
        return;
      }

      try {
        // Fetch user profile from Firestore
        const profileData = await getUserProfile(user.uid);

        if (!profileData) {
          console.error('No profile found for user:', user.uid);
          setAuthLoading(false);
          setIsReady(true);
          router.push('/login');
          return;
        }

        const profile: Profile = {
          id: profileData.id,
          fullName: (profileData.fullName as string) || '',
          email: (profileData.email as string) || user.email || '',
          role: (profileData.role as Profile['role']) || 'manager',
          clubId: (profileData.clubId as string) || null,
          avatarUrl: (profileData.avatarUrl as string) || null,
          phone: (profileData.phone as string) || null,
          createdAt: (profileData.createdAt as string) || new Date().toISOString(),
        };

        setProfile(profile);

        // If no club, redirect to onboarding
        if (!profile.clubId) {
          setAuthLoading(false);
          setIsReady(true);
          if (pathname !== '/onboarding') {
            router.push('/onboarding');
          }
          return;
        }

        // Fetch club
        const club = await clubsService.getById(profile.clubId);
        if (club) {
          setCurrentClub(club);
        }

        // Subscribe to teams (real-time)
        subscribeClubTeams(profile.clubId, (teams) => {
          setTeams(teams);
        });

        setAuthLoading(false);
        setIsReady(true);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setAuthLoading(false);
        setIsReady(true);
      }
    });

    return () => {
      unsubscribeAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-gray-500">Laden...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
