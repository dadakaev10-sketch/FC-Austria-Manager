// ============================================================================
// Football Club Management Platform - Database Types (Firebase / Firestore)
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'coach' | 'assistant_coach' | 'player' | 'parent';

export type AttendanceStatus = 'present' | 'late' | 'injured' | 'absent';

export type MatchLocation = 'home' | 'away';

export type CardType = 'yellow' | 'red' | 'yellow_red';

export type MatchEventType = 'goal' | 'assist' | 'card' | 'substitution';

export type AnnouncementType = 'general' | 'training_reminder' | 'match_reminder' | 'parent_message';

export type TeamCategory =
  | 'U8'
  | 'U10'
  | 'U12'
  | 'U14'
  | 'U15'
  | 'U17'
  | 'U19'
  | 'U21'
  | 'Kampfmannschaft'
  | 'Reserve';

// ============================================================================
// User Profile (stored at users/{uid})
// ============================================================================

export interface Profile {
  id: string;
  clubId: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
}

// ============================================================================
// Core Entities
// ============================================================================

export interface Club {
  id: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  foundedYear: number | null;
  website: string | null;
  createdAt: string;
}

export interface Team {
  id: string;
  clubId: string;
  name: string;
  category: TeamCategory;
  season: string;
  coachId: string | null;
  assistantCoachId: string | null;
  createdAt: string;
  // Joined (client-side enrichment)
  coach?: Profile;
  assistantCoach?: Profile;
  playerCount?: number;
}

/**
 * Player profile. Note: there is NO teamId here.
 * Team assignments are managed via the PlayerTeam junction collection.
 */
export interface Player {
  id: string;
  clubId: string;
  name: string;
  dateOfBirth: string | null;
  position: string | null;
  preferredFoot: 'left' | 'right' | 'both' | null;
  height: number | null;
  weight: number | null;
  jerseyNumber: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  photoUrl: string | null;
  createdAt: string;
  // Client-side enrichment
  teams?: Team[];
  stats?: PlayerStats;
}

/**
 * Many-to-many junction: a player can belong to multiple teams.
 */
export interface PlayerTeam {
  id: string;
  playerId: string;
  teamId: string;
  assignedAt: string;
}

export interface PlayerStats {
  id: string;
  playerId: string;
  speed: number;
  stamina: number;
  technique: number;
  passing: number;
  shooting: number;
  dribbling: number;
  defense: number;
  tacticalUnderstanding: number;
  updatedAt: string;
}

// ============================================================================
// Training Module
// ============================================================================

export interface Training {
  id: string;
  teamId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  focus: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  // Joined
  team?: Team;
  attendance?: TrainingAttendance[];
}

export interface TrainingAttendance {
  id: string;
  trainingId: string;
  playerId: string;
  status: AttendanceStatus;
  notes: string | null;
  // Joined
  player?: Player;
}

// ============================================================================
// Match Module
// ============================================================================

export interface Match {
  id: string;
  teamId: string;
  opponent: string;
  competition: string | null;
  date: string;
  time: string;
  location: string | null;
  homeOrAway: MatchLocation;
  scoreHome: number | null;
  scoreAway: number | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  // Joined
  team?: Team;
  events?: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  eventType: MatchEventType;
  minute: number;
  details: string | null;
  createdAt: string;
  // Joined
  player?: Player;
}

// ============================================================================
// Calendar & Communication
// ============================================================================

export interface Announcement {
  id: string;
  clubId: string;
  teamId: string | null;
  authorId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  isPinned: boolean;
  createdAt: string;
  // Joined
  author?: Profile;
}

export interface CalendarEvent {
  id: string;
  clubId: string;
  teamId: string | null;
  title: string;
  description: string | null;
  eventType: 'training' | 'match' | 'event';
  date: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  createdAt: string;
}
