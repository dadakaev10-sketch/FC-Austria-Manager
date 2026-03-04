'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const TEAM_OPTIONS = [
  { value: '', label: 'Select a team' },
  { value: '1', label: 'U10 Youth' },
  { value: '2', label: 'U12 Development' },
  { value: '3', label: 'U14 Academy' },
  { value: '4', label: 'U16 Junior' },
  { value: '5', label: 'First Team' },
];

const FOCUS_OPTIONS = [
  { value: '', label: 'Select focus area' },
  { value: 'Passing & Movement', label: 'Passing & Movement' },
  { value: 'Shooting Drills', label: 'Shooting Drills' },
  { value: 'Tactical Positioning', label: 'Tactical Positioning' },
  { value: 'Defensive Shape', label: 'Defensive Shape' },
  { value: 'Set Pieces', label: 'Set Pieces' },
  { value: 'Pressing & Counter-Attack', label: 'Pressing & Counter-Attack' },
  { value: 'Ball Control Basics', label: 'Ball Control Basics' },
  { value: 'Fitness & Conditioning', label: 'Fitness & Conditioning' },
  { value: 'Match Simulation', label: 'Match Simulation' },
  { value: 'Other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewTrainingPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    team_id: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    focus: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isValid =
    form.team_id &&
    form.date &&
    form.start_time &&
    form.end_time &&
    form.location &&
    form.focus;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // TODO: Save to Supabase
    // const { data, error } = await supabase
    //   .from('trainings')
    //   .insert({
    //     team_id: form.team_id,
    //     date: form.date,
    //     start_time: form.start_time,
    //     end_time: form.end_time,
    //     location: form.location,
    //     focus: form.focus,
    //     notes: form.notes || null,
    //     created_by: profile.id,
    //   })
    //   .select()
    //   .single();

    // Simulate a short delay then navigate back
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    router.push('/trainings');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back button */}
      <Link
        href="/trainings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trainings
      </Link>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle>Create Training Session</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Team */}
            <Select
              id="team"
              label="Team"
              options={TEAM_OPTIONS}
              value={form.team_id}
              onChange={(e) => updateField('team_id', e.target.value)}
            />

            {/* Date */}
            <Input
              id="date"
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
            />

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="start_time"
                label="Start Time"
                type="time"
                value={form.start_time}
                onChange={(e) => updateField('start_time', e.target.value)}
              />
              <Input
                id="end_time"
                label="End Time"
                type="time"
                value={form.end_time}
                onChange={(e) => updateField('end_time', e.target.value)}
              />
            </div>

            {/* Location */}
            <Input
              id="location"
              label="Location"
              placeholder="e.g. Main Pitch A"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
            />

            {/* Focus */}
            <Select
              id="focus"
              label="Focus Area"
              options={FOCUS_OPTIONS}
              value={form.focus}
              onChange={(e) => updateField('focus', e.target.value)}
            />

            {/* Notes */}
            <div className="space-y-1">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Additional notes about this training session..."
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
              <Link href="/trainings">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Create Training'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
