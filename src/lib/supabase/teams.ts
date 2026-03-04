import { createClient } from './client';

/**
 * Fetch all teams for a club, with coach profiles and player count.
 */
export async function fetchTeams(clubId: string) {
  const supabase = createClient();
  return supabase
    .from('teams')
    .select(
      `*,
      coach:profiles!coach_id(id, full_name, email, phone, avatar_url),
      assistant_coach:profiles!assistant_coach_id(id, full_name, email, phone, avatar_url),
      players(id)`
    )
    .eq('club_id', clubId)
    .order('category', { ascending: true });
}

/**
 * Fetch a single team by ID with coach details.
 */
export async function fetchTeamDetail(teamId: string) {
  const supabase = createClient();
  return supabase
    .from('teams')
    .select(
      `*,
      coach:profiles!coach_id(id, full_name, email, phone, avatar_url, role),
      assistant_coach:profiles!assistant_coach_id(id, full_name, email, phone, avatar_url, role)`
    )
    .eq('id', teamId)
    .single();
}

/**
 * Fetch all players belonging to a specific team.
 */
export async function fetchTeamPlayers(teamId: string) {
  const supabase = createClient();
  return supabase
    .from('players')
    .select('id, name, date_of_birth, position, preferred_foot, jersey_number, photo_url')
    .eq('team_id', teamId)
    .order('jersey_number', { ascending: true });
}

/**
 * Fetch all staff-level profiles for a club (for coach dropdowns).
 */
export async function fetchClubStaff(clubId: string) {
  const supabase = createClient();
  return supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('club_id', clubId)
    .in('role', ['coach', 'assistant_coach', 'club_manager', 'admin'])
    .order('full_name', { ascending: true });
}

/**
 * Insert a new team.
 */
export async function createTeamInDb(data: {
  club_id: string;
  name: string;
  category: string;
  season: string;
  coach_id: string | null;
  assistant_coach_id: string | null;
}) {
  const supabase = createClient();
  return supabase.from('teams').insert(data).select().single();
}

/**
 * Update an existing team.
 */
export async function updateTeamInDb(
  teamId: string,
  data: {
    name?: string;
    category?: string;
    season?: string;
    coach_id?: string | null;
    assistant_coach_id?: string | null;
  }
) {
  const supabase = createClient();
  return supabase.from('teams').update(data).eq('id', teamId).select().single();
}

/**
 * Delete a team by ID.
 */
export async function deleteTeamInDb(teamId: string) {
  const supabase = createClient();
  return supabase.from('teams').delete().eq('id', teamId);
}
