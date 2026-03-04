import { create } from 'zustand';
import type { Club, Team, Player } from '@/types/database';

interface ClubState {
  currentClub: Club | null;
  teams: Team[];
  players: Player[];
  selectedTeamId: string | null;

  setCurrentClub: (club: Club | null) => void;

  // Teams
  setTeams: (teams: Team[]) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, data: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;

  // Players
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, data: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;

  setSelectedTeamId: (id: string | null) => void;
}

export const useClubStore = create<ClubState>((set) => ({
  currentClub: null,
  teams: [],
  players: [],
  selectedTeamId: null,

  setCurrentClub: (currentClub) => set({ currentClub }),

  // Teams
  setTeams: (teams) => set({ teams }),
  addTeam: (team) => set((s) => ({ teams: [...s.teams, team] })),
  updateTeam: (teamId, data) =>
    set((s) => ({
      teams: s.teams.map((t) => (t.id === teamId ? { ...t, ...data } : t)),
    })),
  removeTeam: (teamId) =>
    set((s) => ({ teams: s.teams.filter((t) => t.id !== teamId) })),

  // Players
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((s) => ({ players: [...s.players, player] })),
  updatePlayer: (playerId, data) =>
    set((s) => ({
      players: s.players.map((p) =>
        p.id === playerId ? { ...p, ...data } : p
      ),
    })),
  removePlayer: (playerId) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== playerId) })),

  setSelectedTeamId: (selectedTeamId) => set({ selectedTeamId }),
}));
