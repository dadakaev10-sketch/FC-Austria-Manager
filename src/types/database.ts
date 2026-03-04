// ============================================================================
// Football Club Management Platform - Database Types
// ============================================================================

export type UserRole = 'admin' | 'club_manager' | 'coach' | 'assistant_coach' | 'player' | 'parent';

export type AttendanceStatus = 'present' | 'late' | 'injured' | 'absent';

export type MatchLocation = 'home' | 'away';

export type CardType = 'yellow' | 'red' | 'yellow_red';

export type MatchEventType = 'goal' | 'assist' | 'card' | 'substitution';

export type AnnouncementType = 'general' | 'training_reminder' | 'match_reminder' | 'parent_message';

// ============================================================================
// Core Entities
// ============================================================================

export interface Club {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  founded_year: number | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  club_id: string;
  name: string;
  category: string; // e.g. "U8", "U10", "First Team"
  season: string; // e.g. "2025/2026"
  coach_id: string | null;
  assistant_coach_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  club?: Club;
  coach?: Profile;
  assistant_coach?: Profile;
  players?: Player[];
}

export interface Player {
  id: string;
  team_id: string;
  user_id: string | null;
  name: string;
  date_of_birth: string;
  position: string;
  preferred_foot: 'left' | 'right' | 'both';
  height: number | null; // cm
  weight: number | null; // kg
  jersey_number: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  team?: Team;
  stats?: PlayerStats;
  ratings?: PlayerRating[];
}

export interface PlayerStats {
  id: string;
  player_id: string;
  speed: number; // 1-100
  stamina: number;
  technique: number;
  passing: number;
  shooting: number;
  dribbling: number;
  defense: number;
  tactical_understanding: number;
  updated_at: string;
}

export interface Profile {
  id: string;          // Same as auth.users.id
  club_id: string | null;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Training Module
// ============================================================================

export interface Training {
  id: string;
  team_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  focus: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  team?: Team;
  attendance?: TrainingAttendance[];
}

export interface TrainingAttendance {
  id: string;
  training_id: string;
  player_id: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at: string;
  // Joined
  player?: Player;
}

// ============================================================================
// Match Module
// ============================================================================

export interface Match {
  id: string;
  team_id: string;
  opponent: string;
  competition: string | null;
  date: string;
  time: string;
  location: string | null;
  home_or_away: MatchLocation;
  score_home: number | null;
  score_away: number | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined
  team?: Team;
  events?: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string;
  event_type: MatchEventType;
  minute: number;
  details: string | null; // e.g. "penalty", "header" for goals; card type for cards
  created_at: string;
  // Joined
  player?: Player;
}

// ============================================================================
// Player Ratings
// ============================================================================

export interface PlayerRating {
  id: string;
  player_id: string;
  rated_by: string;
  context_type: 'training' | 'match';
  context_id: string; // training_id or match_id
  speed: number; // 1-10
  technique: number;
  passing: number;
  shooting: number;
  defense: number;
  tactical_awareness: number;
  overall_notes: string | null;
  created_at: string;
  // Joined
  player?: Player;
}

// ============================================================================
// Calendar & Communication
// ============================================================================

export interface CalendarEvent {
  id: string;
  club_id: string;
  team_id: string | null;
  title: string;
  description: string | null;
  event_type: 'training' | 'match' | 'event';
  date: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  club_id: string;
  team_id: string | null;
  author_id: string;
  title: string;
  content: string;
  announcement_type: AnnouncementType;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  author?: Profile;
}

// ============================================================================
// Membership (links users to teams with roles)
// ============================================================================

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}
