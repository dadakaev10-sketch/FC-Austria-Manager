'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Pin,
  Plus,
  Bell,
  Send,
  Dumbbell,
  Trophy,
  Clock,
  MapPin,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MockAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'general' | 'training_reminder' | 'match_reminder' | 'parent_message';
  is_pinned: boolean;
  author_name: string;
  team_name: string | null;
  created_at: string;
}

interface MockReminder {
  id: string;
  title: string;
  type: 'training' | 'match';
  date: string;
  time: string;
  location: string;
  team_name: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: 'a1',
    title: 'Training schedule updated for March',
    content:
      'The March training schedule has been finalized. Please check the calendar for your team-specific sessions. Note that U12 sessions have moved to Main Pitch A starting this week.',
    announcement_type: 'general',
    is_pinned: true,
    author_name: 'Coach Martinez',
    team_name: null,
    created_at: '2026-03-03T10:00:00Z',
  },
  {
    id: 'a2',
    title: 'Match day kits available for pickup',
    content:
      'New match day kits for all youth teams are now ready for pickup at the club office. Please collect them before Saturday. Each player receives a home and away kit.',
    announcement_type: 'general',
    is_pinned: true,
    author_name: 'Club Admin',
    team_name: null,
    created_at: '2026-03-02T14:30:00Z',
  },
  {
    id: 'a3',
    title: 'U12 training session reminder',
    content:
      'Reminder that U12 Development has training tomorrow at 16:00 on Main Pitch A. Please arrive 15 minutes early for warm-up. Bring shin guards and water.',
    announcement_type: 'training_reminder',
    is_pinned: false,
    author_name: 'Coach Martinez',
    team_name: 'U12 Development',
    created_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'a4',
    title: 'Saturday match vs FC Adler - confirm availability',
    content:
      'Please confirm your availability for the U14 match against FC Adler this Saturday at 10:00. Reply to this announcement or contact Coach Martinez directly by Thursday.',
    announcement_type: 'match_reminder',
    is_pinned: false,
    author_name: 'Coach Martinez',
    team_name: 'U14 Academy',
    created_at: '2026-02-28T16:00:00Z',
  },
  {
    id: 'a5',
    title: 'Parent volunteer opportunity',
    content:
      'We are looking for parent volunteers to help organize the upcoming fundraiser gala on March 22nd. If you are interested, please reach out to the club office.',
    announcement_type: 'parent_message',
    is_pinned: false,
    author_name: 'Club Admin',
    team_name: null,
    created_at: '2026-02-27T11:00:00Z',
  },
  {
    id: 'a6',
    title: 'End of season tournament registration open',
    content:
      'Registration for the spring tournament is now open. All teams U10 through U16 are eligible. Deadline for registration is March 31st. Contact your coach for details.',
    announcement_type: 'general',
    is_pinned: false,
    author_name: 'Club Admin',
    team_name: null,
    created_at: '2026-02-25T08:30:00Z',
  },
];

const today = new Date();
const toISODate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

const MOCK_REMINDERS: MockReminder[] = [
  {
    id: 'r1',
    title: 'U12 Passing & Movement',
    type: 'training',
    date: toISODate(addDays(today, 1)),
    time: '16:00',
    location: 'Main Pitch A',
    team_name: 'U12 Development',
  },
  {
    id: 'r2',
    title: 'U14 vs FC Adler',
    type: 'match',
    date: toISODate(addDays(today, 3)),
    time: '10:00',
    location: 'Home Stadium',
    team_name: 'U14 Academy',
  },
  {
    id: 'r3',
    title: 'U16 Pressing & Counter-Attack',
    type: 'training',
    date: toISODate(addDays(today, 4)),
    time: '16:00',
    location: 'Training Ground B',
    team_name: 'U16 Junior',
  },
  {
    id: 'r4',
    title: 'First Team vs SV Stern',
    type: 'match',
    date: toISODate(addDays(today, 7)),
    time: '15:30',
    location: 'Home Stadium',
    team_name: 'First Team',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAnnouncementBadgeVariant(type: string) {
  switch (type) {
    case 'training_reminder':
      return 'info' as const;
    case 'match_reminder':
      return 'warning' as const;
    case 'parent_message':
      return 'success' as const;
    default:
      return 'default' as const;
  }
}

function formatAnnouncementType(type: string) {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'training_reminder', label: 'Training Reminder' },
  { value: 'match_reminder', label: 'Match Reminder' },
  { value: 'parent_message', label: 'Parent Message' },
];

const TEAM_OPTIONS = [
  { value: '', label: 'Club-wide (all teams)' },
  { value: 'U10 Youth', label: 'U10 Youth' },
  { value: 'U12 Development', label: 'U12 Development' },
  { value: 'U14 Academy', label: 'U14 Academy' },
  { value: 'U16 Junior', label: 'U16 Junior' },
  { value: 'First Team', label: 'First Team' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CommunicationPage() {
  const { isCoachOrAbove } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'announcements' | 'reminders'>('announcements');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formType, setFormType] = useState('general');
  const [formTeam, setFormTeam] = useState('');
  const [formPinned, setFormPinned] = useState(false);

  const canCreate = isCoachOrAbove();

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = useMemo(() => {
    return [...MOCK_ANNOUNCEMENTS].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, []);

  function handleSubmit() {
    // In production, this would send the data to Supabase
    // For now, just close the modal and reset form
    setIsModalOpen(false);
    setFormTitle('');
    setFormContent('');
    setFormType('general');
    setFormTeam('');
    setFormPinned(false);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="mt-1 text-sm text-gray-500">
            Announcements, reminders, and messages for teams and parents.
          </p>
        </div>
        {canCreate && (
          <Button onClick={openModal}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
        <button
          onClick={() => setActiveTab('announcements')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'announcements'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Announcements
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={cn(
            'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'reminders'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Bell className="h-4 w-4" />
          Reminders
        </button>
      </div>

      {/* Announcements tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="transition-shadow hover:shadow-md">
              <CardContent className="py-5">
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        {announcement.is_pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <Pin className="h-3 w-3" />
                            Pinned
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>{announcement.author_name}</span>
                        <span>&middot;</span>
                        <span>{formatDate(announcement.created_at)}</span>
                        {announcement.team_name && (
                          <>
                            <span>&middot;</span>
                            <span className="font-medium text-emerald-600">
                              {announcement.team_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={getAnnouncementBadgeVariant(
                        announcement.announcement_type
                      )}
                    >
                      {formatAnnouncementType(announcement.announcement_type)}
                    </Badge>
                  </div>

                  {/* Content preview */}
                  <p className="text-sm leading-relaxed text-gray-600">
                    {announcement.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          {sortedAnnouncements.length === 0 && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    No announcements yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Create a new announcement to share information with your teams.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reminders tab */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Upcoming trainings and matches automatically generated from the schedule.
          </p>
          {MOCK_REMINDERS.map((reminder) => {
            const isMatch = reminder.type === 'match';
            return (
              <Card key={reminder.id} className="transition-shadow hover:shadow-md">
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                        isMatch
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-emerald-100 text-emerald-600'
                      )}
                    >
                      {isMatch ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">
                          {reminder.title}
                        </h3>
                        <Badge variant={isMatch ? 'info' : 'success'}>
                          {isMatch ? 'Match' : 'Training'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-emerald-600">
                        {reminder.team_name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(reminder.date)} &middot; {reminder.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {reminder.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {MOCK_REMINDERS.length === 0 && (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">
                    No upcoming reminders
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Reminders will appear here when trainings or matches are scheduled.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* New Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Announcement"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            id="announcement-title"
            label="Title"
            placeholder="Announcement title..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="announcement-content"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="announcement-content"
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Write your announcement..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id="announcement-type"
              label="Type"
              options={TYPE_OPTIONS}
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
            />
            <Select
              id="announcement-team"
              label="Team (optional)"
              options={TEAM_OPTIONS}
              value={formTeam}
              onChange={(e) => setFormTeam(e.target.value)}
            />
          </div>

          {/* Pinned toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formPinned}
              onClick={() => setFormPinned(!formPinned)}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                formPinned ? 'bg-emerald-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                  formPinned ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Pin className="h-4 w-4" />
              Pin this announcement
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formContent.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
