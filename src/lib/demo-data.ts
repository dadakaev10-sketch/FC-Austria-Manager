import type { Profile, Club, Team, Player, PlayerTeam, TeamCategory } from '@/types/database';

// ============================================================================
// Demo Mode - allows exploring the app without Firebase
// Austrian football club demo data
// ============================================================================

export const DEMO_PROFILE: Profile = {
  id: 'demo-user-001',
  clubId: 'demo-club-001',
  fullName: 'Max Hofer',
  email: 'demo@fcmanager.at',
  role: 'admin',
  avatarUrl: null,
  phone: '+43 660 1234567',
  createdAt: new Date().toISOString(),
};

export const DEMO_CLUB: Club = {
  id: 'demo-club-001',
  name: 'FC Austria Wien Jugend',
  logoUrl: null,
  address: 'Fischhofgasse 12',
  city: 'Wien',
  country: 'Oesterreich',
  foundedYear: 1911,
  website: 'https://fk-austria.at',
  createdAt: new Date().toISOString(),
};

export const DEMO_TEAMS: Team[] = [
  {
    id: 'demo-team-u15',
    clubId: 'demo-club-001',
    name: 'U15 Jugend',
    category: 'U15' as TeamCategory,
    season: '2025/2026',
    coachId: null,
    assistantCoachId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-team-u17',
    clubId: 'demo-club-001',
    name: 'U17 Akademie',
    category: 'U17' as TeamCategory,
    season: '2025/2026',
    coachId: null,
    assistantCoachId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-team-u19',
    clubId: 'demo-club-001',
    name: 'U19 Juniors',
    category: 'U19' as TeamCategory,
    season: '2025/2026',
    coachId: null,
    assistantCoachId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-team-u21',
    clubId: 'demo-club-001',
    name: 'U21 Amateure',
    category: 'U21' as TeamCategory,
    season: '2025/2026',
    coachId: null,
    assistantCoachId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-team-kampf',
    clubId: 'demo-club-001',
    name: 'Kampfmannschaft',
    category: 'Kampfmannschaft' as TeamCategory,
    season: '2025/2026',
    coachId: null,
    assistantCoachId: null,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_PLAYERS: Player[] = [
  {
    id: 'demo-player-001',
    clubId: 'demo-club-001',
    name: 'Lukas Gruber',
    dateOfBirth: '2010-03-15',
    position: 'goalkeeper',
    preferredFoot: 'right',
    height: 175,
    weight: 65,
    jerseyNumber: 1,
    contactEmail: null,
    contactPhone: null,
    parentName: 'Thomas Gruber',
    parentEmail: 'thomas.gruber@gmx.at',
    parentPhone: '+43 664 1112233',
    photoUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-player-002',
    clubId: 'demo-club-001',
    name: 'Maximilian Bauer',
    dateOfBirth: '2010-07-22',
    position: 'center-back',
    preferredFoot: 'right',
    height: 172,
    weight: 63,
    jerseyNumber: 4,
    contactEmail: null,
    contactPhone: null,
    parentName: 'Stefan Bauer',
    parentEmail: 'stefan.bauer@aon.at',
    parentPhone: '+43 676 2223344',
    photoUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-player-003',
    clubId: 'demo-club-001',
    name: 'Felix Steiner',
    dateOfBirth: '2010-01-08',
    position: 'central-midfielder',
    preferredFoot: 'left',
    height: 168,
    weight: 58,
    jerseyNumber: 8,
    contactEmail: null,
    contactPhone: null,
    parentName: 'Maria Steiner',
    parentEmail: 'maria.steiner@gmail.com',
    parentPhone: '+43 650 3334455',
    photoUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-player-004',
    clubId: 'demo-club-001',
    name: 'David Huber',
    dateOfBirth: '2010-11-30',
    position: 'striker',
    preferredFoot: 'right',
    height: 170,
    weight: 60,
    jerseyNumber: 9,
    contactEmail: null,
    contactPhone: null,
    parentName: 'Michael Huber',
    parentEmail: 'michael.huber@drei.at',
    parentPhone: '+43 660 4445566',
    photoUrl: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-player-005',
    clubId: 'demo-club-001',
    name: 'Elias Wagner',
    dateOfBirth: '2010-05-17',
    position: 'left-winger',
    preferredFoot: 'both',
    height: 166,
    weight: 56,
    jerseyNumber: 11,
    contactEmail: null,
    contactPhone: null,
    parentName: 'Andrea Wagner',
    parentEmail: 'andrea.wagner@outlook.at',
    parentPhone: '+43 699 5556677',
    photoUrl: null,
    createdAt: new Date().toISOString(),
  },
];

export const DEMO_PLAYER_TEAMS: PlayerTeam[] = [
  { id: 'demo-pt-001', playerId: 'demo-player-001', teamId: 'demo-team-u15', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-002', playerId: 'demo-player-002', teamId: 'demo-team-u15', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-003', playerId: 'demo-player-003', teamId: 'demo-team-u15', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-004', playerId: 'demo-player-003', teamId: 'demo-team-u17', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-005', playerId: 'demo-player-004', teamId: 'demo-team-u17', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-006', playerId: 'demo-player-005', teamId: 'demo-team-u15', assignedAt: new Date().toISOString() },
  { id: 'demo-pt-007', playerId: 'demo-player-005', teamId: 'demo-team-u17', assignedAt: new Date().toISOString() },
];

const DEMO_COOKIE = 'fc_demo_mode';

export function enableDemoMode() {
  if (typeof window !== 'undefined') {
    document.cookie = `${DEMO_COOKIE}=true;path=/;max-age=86400;SameSite=Lax`;
  }
}

export function disableDemoMode() {
  if (typeof window !== 'undefined') {
    document.cookie = `${DEMO_COOKIE}=;path=/;max-age=0`;
  }
}

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes(`${DEMO_COOKIE}=true`);
}
