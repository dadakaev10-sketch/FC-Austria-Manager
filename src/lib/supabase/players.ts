import { createClient } from './client';

/**
 * Fetch all players for a club (across all teams), with team name joined.
 */
export async function fetchClubPlayers(clubId: string) {
  const supabase = createClient();
  return supabase
    .from('players')
    .select(
      `*,
      team:teams!inner(id, name, club_id)`
    )
    .eq('team.club_id', clubId)
    .order('name', { ascending: true });
}

/**
 * Fetch a single player by ID with stats and team info.
 */
export async function fetchPlayerDetail(playerId: string) {
  const supabase = createClient();
  return supabase
    .from('players')
    .select(
      `*,
      team:teams(id, name, category),
      stats:player_stats(*)`
    )
    .eq('id', playerId)
    .single();
}

/**
 * Fetch ratings for a player (most recent first).
 */
export async function fetchPlayerRatings(playerId: string) {
  const supabase = createClient();
  return supabase
    .from('player_ratings')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(20);
}

/**
 * Insert a new player.
 */
export async function createPlayerInDb(data: {
  team_id: string;
  name: string;
  date_of_birth?: string | null;
  position?: string | null;
  preferred_foot?: 'left' | 'right' | 'both' | null;
  height?: number | null;
  weight?: number | null;
  jersey_number?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
}) {
  const supabase = createClient();
  return supabase.from('players').insert(data).select().single();
}

/**
 * Update a player.
 */
export async function updatePlayerInDb(
  playerId: string,
  data: {
    team_id?: string;
    name?: string;
    date_of_birth?: string | null;
    position?: string | null;
    preferred_foot?: 'left' | 'right' | 'both' | null;
    height?: number | null;
    weight?: number | null;
    jersey_number?: number | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    parent_name?: string | null;
    parent_email?: string | null;
    parent_phone?: string | null;
  }
) {
  const supabase = createClient();
  return supabase.from('players').update(data).eq('id', playerId).select().single();
}

/**
 * Delete a player by ID.
 */
export async function deletePlayerInDb(playerId: string) {
  const supabase = createClient();
  return supabase.from('players').delete().eq('id', playerId);
}

/**
 * Upsert player stats (one row per player via UNIQUE constraint).
 */
export async function upsertPlayerStats(
  playerId: string,
  stats: {
    speed: number;
    stamina: number;
    technique: number;
    passing: number;
    shooting: number;
    dribbling: number;
    defense: number;
    tactical_understanding: number;
  }
) {
  const supabase = createClient();
  return supabase
    .from('player_stats')
    .upsert({ player_id: playerId, ...stats }, { onConflict: 'player_id' })
    .select()
    .single();
}
