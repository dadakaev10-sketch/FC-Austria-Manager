# FC Manager - Football Club Management Platform

## Architecture Documentation

### 1. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client Browser                     │
│                  (Next.js App Router)                  │
├─────────────────────────────────────────────────────┤
│  React Components │ Zustand Stores │ Recharts Charts  │
│  TailwindCSS      │ Lucide Icons   │ date-fns         │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────┐
│                   Vercel Edge Network                  │
│              (Next.js SSR + Static Pages)              │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                  Supabase Platform                     │
├──────────┬──────────┬──────────┬───────────────────┤
│   Auth   │ Postgres │ Storage  │     Realtime       │
│  (JWT)   │  (RLS)   │ (Files)  │  (WebSocket)       │
└──────────┴──────────┴──────────┴───────────────────┘
```

### 2. Tech Stack

| Layer           | Technology                    |
|-----------------|-------------------------------|
| Frontend        | Next.js 16 (App Router)       |
| Language        | TypeScript                    |
| Styling         | TailwindCSS                   |
| State           | Zustand                       |
| Charts          | Recharts                      |
| Icons           | Lucide React                  |
| Date Utils      | date-fns                      |
| Backend         | Supabase (BaaS)               |
| Database        | PostgreSQL                    |
| Auth            | Supabase Auth (JWT)           |
| Storage         | Supabase Storage              |
| Realtime        | Supabase Realtime (WebSocket) |
| Deployment      | Vercel                        |

### 3. Folder Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx              # Root layout (Inter font)
│   ├── page.tsx                # Redirect to /dashboard or /login
│   ├── (auth)/
│   │   ├── layout.tsx          # Centered auth layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── (dashboard)/
│       ├── layout.tsx          # AuthProvider + AppShell
│       ├── dashboard/
│       │   ├── page.tsx        # Main dashboard overview
│       │   └── loading.tsx     # Skeleton loader
│       ├── teams/
│       │   ├── page.tsx        # Team list
│       │   └── [id]/page.tsx   # Team detail (roster, tabs)
│       ├── players/
│       │   ├── page.tsx        # Player list with filters
│       │   └── [id]/page.tsx   # Player profile + stats
│       ├── trainings/
│       │   ├── page.tsx        # Training list grouped by date
│       │   └── new/page.tsx    # Create training form
│       ├── matches/
│       │   ├── page.tsx        # Match list (upcoming/results)
│       │   └── [id]/page.tsx   # Match report + events
│       ├── analytics/page.tsx  # Charts and statistics
│       ├── calendar/page.tsx   # Monthly calendar view
│       ├── communication/page.tsx # Announcements & reminders
│       └── settings/page.tsx   # Profile, club, roles, notifications
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── empty-state.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── select.tsx
│   │   └── stat-card.tsx
│   ├── layout/
│   │   ├── app-shell.tsx       # Main layout wrapper
│   │   ├── header.tsx          # Top bar
│   │   └── sidebar.tsx         # Navigation sidebar
│   ├── analytics/
│   │   └── player-development-chart.tsx
│   ├── matches/
│   │   └── match-event-item.tsx
│   ├── players/
│   │   └── player-stats-bar.tsx
│   ├── teams/
│   │   └── create-team-modal.tsx
│   └── trainings/
│       └── attendance-tracker.tsx
├── hooks/
│   ├── use-supabase.ts         # Memoized Supabase client
│   └── use-realtime.ts         # Realtime subscription hook
├── lib/
│   ├── utils.ts                # Shared utility functions
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── middleware.ts       # Auth session middleware
├── stores/
│   ├── auth-store.ts           # User profile & role state
│   ├── club-store.ts           # Club & teams state
│   └── ui-store.ts             # Sidebar & UI state
├── types/
│   └── database.ts             # TypeScript type definitions
└── middleware.ts                # Next.js route middleware
```

### 4. Database Schema

See `supabase/schema.sql` for the complete SQL. Summary:

**13 tables:**
- `clubs` - Club organizations
- `profiles` - User profiles (extends auth.users)
- `teams` - Teams within a club
- `players` - Player profiles with detailed attributes
- `player_stats` - Performance attributes (speed, stamina, etc. 1-100)
- `trainings` - Training sessions
- `training_attendance` - Per-player attendance tracking
- `matches` - Match records
- `match_events` - Goals, assists, cards, substitutions
- `player_ratings` - Coach ratings per training/match (1-10)
- `calendar_events` - Unified calendar
- `announcements` - Team/club announcements
- `team_memberships` - User-team-role associations

**8 enums:** user_role, preferred_foot, attendance_status, home_away, match_event_type, rating_context, calendar_event_type, announcement_type

**Key relationships:**
```
Club 1──* Team 1──* Player
                1──* Training 1──* TrainingAttendance
                1──* Match 1──* MatchEvent
Player 1──* PlayerRating
Player 1──1 PlayerStats
Profile *──* Team (via TeamMembership)
```

**Security:** Row Level Security (RLS) enabled on all tables. Users can only access data within their club. Role-based write permissions enforce that only coaches+ can modify operational data.

### 5. Authentication & Authorization

**Auth flow:**
1. User registers/logs in via Supabase Auth (email/password)
2. On signup, a database trigger auto-creates a `profiles` row
3. Middleware refreshes JWT session on every request
4. Unauthenticated users are redirected to `/login`
5. Dashboard layout fetches profile + club data on mount

**Roles (hierarchical):**
| Role             | Permissions                                      |
|------------------|--------------------------------------------------|
| Admin            | Full access, manage roles, delete data            |
| Club Manager     | Manage club settings, teams, all operational data |
| Coach            | Manage trainings, matches, ratings, players       |
| Assistant Coach  | Same as coach (read + write operational data)     |
| Player           | View own profile, team data, schedule             |
| Parent           | View child's data, receive parent messages         |

### 6. API Design

All data access goes through Supabase client libraries (no custom API routes needed for MVP).

**Query patterns:**
```typescript
// Fetch teams for a club
supabase.from('teams').select('*, coach:profiles!coach_id(*)').eq('club_id', clubId)

// Fetch players with stats
supabase.from('players').select('*, team:teams(*), stats:player_stats(*)').eq('team_id', teamId)

// Create training with attendance
supabase.from('trainings').insert({ team_id, date, start_time, end_time, location, focus })

// Record match events
supabase.from('match_events').insert({ match_id, player_id, event_type, minute, details })

// Player ratings over time
supabase.from('player_ratings').select('*').eq('player_id', playerId).order('created_at')

// Realtime announcements
supabase.channel('announcements').on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, callback)
```

### 7. UI Navigation

**Sidebar:**
```
Dashboard       → /dashboard
Teams           → /teams
Players         → /players
Trainings       → /trainings
Matches         → /matches
Analytics       → /analytics
Calendar        → /calendar
Communication   → /communication
Settings        → /settings
```

**Page details:**

| Page             | Features                                                |
|------------------|---------------------------------------------------------|
| Dashboard        | Stats overview, today's training, upcoming matches      |
| Teams            | Team grid, create team, team detail with roster/tabs    |
| Players          | Searchable/filterable list, player profile + stats bars |
| Trainings        | Date-grouped list, create form, attendance tracker      |
| Matches          | Upcoming/results split, match report with event timeline|
| Analytics        | Player stats, team comparison, training trends (charts) |
| Calendar         | Monthly grid with color-coded events, day detail panel  |
| Communication    | Announcements, reminders, create announcement modal     |
| Settings         | Profile, club settings, role management, notifications  |

### 8. Supabase Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Create `.env.local` from `.env.local.example`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Open the Supabase SQL Editor
5. Paste and run the contents of `supabase/schema.sql`
6. Enable Realtime on the `announcements` table (Database > Replication)
7. Create a Supabase Storage bucket named `avatars` (public)
8. Run the app: `npm run dev`

### 9. Development Roadmap

**Phase 1 - Foundation (Week 1-2)**
- [x] Project setup (Next.js, TailwindCSS, Supabase)
- [x] Database schema & RLS policies
- [x] Authentication (login, register, middleware)
- [x] Layout (sidebar, header, app shell)
- [x] Dashboard overview page

**Phase 2 - Core Modules (Week 3-4)**
- [x] Teams CRUD + roster view
- [x] Players CRUD + profile page + stats
- [x] Trainings CRUD + attendance tracking
- [x] Matches CRUD + event timeline

**Phase 3 - Analytics & Communication (Week 5-6)**
- [x] Analytics dashboards with Recharts
- [x] Calendar with event management
- [x] Announcements & reminders system
- [x] Settings & role management

**Phase 4 - Polish & Production (Week 7-8)**
- [ ] Replace all mock data with live Supabase queries
- [ ] Add form validation (zod)
- [ ] File uploads (player photos, club logo)
- [ ] Email notifications (Supabase Edge Functions)
- [ ] Mobile responsiveness refinement
- [ ] Error boundaries & toast notifications
- [ ] Loading states for all data fetches
- [ ] Search functionality (global search)

**Phase 5 - Advanced Features (Week 9-12)**
- [ ] Player development charts with historical data
- [ ] PDF export (match reports, player profiles)
- [ ] Drag-and-drop lineup builder
- [ ] Multi-season support
- [ ] Parent portal (restricted view)
- [ ] Push notifications
- [ ] Data import/export (CSV)
- [ ] Multi-language support (i18n)
