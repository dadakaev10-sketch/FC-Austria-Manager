// ============================================================================
// Firestore CRUD Services - Real-time subscriptions & document operations
// ============================================================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Club,
  Team,
  Player,
  PlayerTeam,
  PlayerStats,
  Training,
  TrainingAttendance,
  Match,
  MatchEvent,
  Announcement,
  CalendarEvent,
} from '@/types/database';

// ============================================================================
// Helpers
// ============================================================================

/** Convert Firestore Timestamps to ISO strings */
function normalizeDoc<T>(docSnap: DocumentData, id: string): T {
  const data: Record<string, unknown> = { ...docSnap, id };
  // Convert any Timestamp fields to ISO strings
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Timestamp) {
      data[key] = (data[key] as Timestamp).toDate().toISOString();
    }
  }
  return data as T;
}

/** Generic service factory for a Firestore collection */
function createService<T extends { id: string }>(
  collectionName: string,
  defaultOrderField: string = 'createdAt',
  defaultOrderDir: 'asc' | 'desc' = 'desc'
) {
  const colRef = collection(db, collectionName);

  return {
    /**
     * Subscribe to real-time updates. Returns unsubscribe function.
     */
    subscribe(
      callback: (items: T[]) => void,
      constraints: QueryConstraint[] = []
    ): Unsubscribe {
      const q = query(
        colRef,
        ...constraints,
        orderBy(defaultOrderField, defaultOrderDir)
      );
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => normalizeDoc<T>(d.data(), d.id));
        callback(items);
      });
    },

    /**
     * Subscribe with custom query constraints (no default ordering).
     */
    subscribeCustom(
      callback: (items: T[]) => void,
      constraints: QueryConstraint[]
    ): Unsubscribe {
      const q = query(colRef, ...constraints);
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => normalizeDoc<T>(d.data(), d.id));
        callback(items);
      });
    },

    /**
     * Create a new document.
     */
    async create(data: Omit<T, 'id'>): Promise<string> {
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    },

    /**
     * Update an existing document.
     */
    async update(id: string, data: Partial<T>): Promise<void> {
      const docRef = doc(db, collectionName, id);
      // Remove id from the update payload
      const { id: _id, ...updateData } = data as Record<string, unknown>;
      await updateDoc(docRef, updateData);
    },

    /**
     * Delete a document.
     */
    async delete(id: string): Promise<void> {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    },

    /**
     * Get a single document by ID.
     */
    async getById(id: string): Promise<T | null> {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return normalizeDoc<T>(docSnap.data(), docSnap.id);
    },
  };
}

// ============================================================================
// Collection Services
// ============================================================================

export const clubsService = createService<Club>('clubs', 'createdAt', 'desc');

export const teamsService = createService<Team>('teams', 'category', 'asc');

export const playersService = createService<Player>('players', 'name', 'asc');

export const playerTeamsService = createService<PlayerTeam>('player_teams', 'assignedAt', 'desc');

export const playerStatsService = createService<PlayerStats>('player_stats', 'updatedAt', 'desc');

export const trainingsService = createService<Training>('trainings', 'date', 'desc');

export const trainingAttendanceService = createService<TrainingAttendance>('training_attendance', 'trainingId', 'asc');

export const matchesService = createService<Match>('matches', 'date', 'desc');

export const matchEventsService = createService<MatchEvent>('match_events', 'minute', 'asc');

export const announcementsService = createService<Announcement>('announcements', 'createdAt', 'desc');

export const calendarEventsService = createService<CalendarEvent>('calendar_events', 'date', 'asc');

// ============================================================================
// Convenience query helpers
// ============================================================================

/** Subscribe to teams for a specific club */
export function subscribeClubTeams(clubId: string, callback: (teams: Team[]) => void): Unsubscribe {
  return teamsService.subscribe(callback, [where('clubId', '==', clubId)]);
}

/** Subscribe to players for a specific club */
export function subscribeClubPlayers(clubId: string, callback: (players: Player[]) => void): Unsubscribe {
  return playersService.subscribe(callback, [where('clubId', '==', clubId)]);
}

/** Subscribe to player-team assignments for a specific player */
export function subscribePlayerTeams(playerId: string, callback: (assignments: PlayerTeam[]) => void): Unsubscribe {
  return playerTeamsService.subscribeCustom(callback, [
    where('playerId', '==', playerId),
    orderBy('assignedAt', 'desc'),
  ]);
}

/** Subscribe to player-team assignments for a specific team */
export function subscribeTeamPlayers(teamId: string, callback: (assignments: PlayerTeam[]) => void): Unsubscribe {
  return playerTeamsService.subscribeCustom(callback, [
    where('teamId', '==', teamId),
    orderBy('assignedAt', 'desc'),
  ]);
}

/** Subscribe to all player-team assignments for a club's teams */
export function subscribeAllPlayerTeams(teamIds: string[], callback: (assignments: PlayerTeam[]) => void): Unsubscribe {
  if (teamIds.length === 0) {
    callback([]);
    return () => {};
  }
  // Firestore 'in' queries support up to 30 items
  const chunks = [];
  for (let i = 0; i < teamIds.length; i += 30) {
    chunks.push(teamIds.slice(i, i + 30));
  }
  // For simplicity, use the first chunk (most clubs have < 30 teams)
  return playerTeamsService.subscribeCustom(callback, [
    where('teamId', 'in', chunks[0]),
  ]);
}

/** Subscribe to trainings for a specific team */
export function subscribeTeamTrainings(teamId: string, callback: (trainings: Training[]) => void): Unsubscribe {
  return trainingsService.subscribe(callback, [where('teamId', '==', teamId)]);
}

/** Subscribe to matches for a specific team */
export function subscribeTeamMatches(teamId: string, callback: (matches: Match[]) => void): Unsubscribe {
  return matchesService.subscribe(callback, [where('teamId', '==', teamId)]);
}

/** Subscribe to announcements for a specific club */
export function subscribeClubAnnouncements(clubId: string, callback: (items: Announcement[]) => void): Unsubscribe {
  return announcementsService.subscribe(callback, [where('clubId', '==', clubId)]);
}

/** Subscribe to calendar events for a specific club */
export function subscribeClubCalendarEvents(clubId: string, callback: (items: CalendarEvent[]) => void): Unsubscribe {
  return calendarEventsService.subscribe(callback, [where('clubId', '==', clubId)]);
}

/** Subscribe to match events for a specific match */
export function subscribeMatchEvents(matchId: string, callback: (events: MatchEvent[]) => void): Unsubscribe {
  return matchEventsService.subscribe(callback, [where('matchId', '==', matchId)]);
}

/** Subscribe to training attendance for a specific training */
export function subscribeTrainingAttendance(trainingId: string, callback: (items: TrainingAttendance[]) => void): Unsubscribe {
  return trainingAttendanceService.subscribeCustom(callback, [
    where('trainingId', '==', trainingId),
  ]);
}

/** Get user profile from Firestore */
export async function getUserProfile(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return normalizeDoc<{ id: string } & Record<string, unknown>>(docSnap.data(), docSnap.id);
}

/** Update user profile */
export async function updateUserProfile(uid: string, data: Record<string, unknown>) {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
}

// Re-export query helpers from firebase/firestore for convenience
export { where, orderBy, query } from 'firebase/firestore';
