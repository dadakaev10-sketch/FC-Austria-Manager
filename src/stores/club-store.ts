import { create } from 'zustand';
import type { Club, Team } from '@/types/database';

interface ClubState {
  currentClub: Club | null;
  teams: Team[];
  selectedTeamId: string | null;
  setCurrentClub: (club: Club | null) => void;
  setTeams: (teams: Team[]) => void;
  setSelectedTeamId: (id: string | null) => void;
}

export const useClubStore = create<ClubState>((set) => ({
  currentClub: null,
  teams: [],
  selectedTeamId: null,
  setCurrentClub: (currentClub) => set({ currentClub }),
  setTeams: (teams) => set({ teams }),
  setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
}));
