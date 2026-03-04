'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useClubStore } from '@/stores/club-store';
import { clubsService, updateUserProfile } from '@/lib/firebase/services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Building2, ArrowRight } from 'lucide-react';
import type { Club } from '@/types/database';

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile } = useAuthStore();
  const { setCurrentClub } = useClubStore();

  const [clubName, setClubName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Oesterreich');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateClub(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setLoading(true);

    try {
      // 1. Create the club in Firestore
      const clubId = await clubsService.create({
        name: clubName.trim(),
        logoUrl: null,
        address: null,
        city: city.trim() || null,
        country: country.trim() || null,
        foundedYear: null,
        website: null,
      });

      const club: Club = {
        id: clubId,
        name: clubName.trim(),
        logoUrl: null,
        address: null,
        city: city.trim() || null,
        country: country.trim() || null,
        foundedYear: null,
        website: null,
        createdAt: new Date().toISOString(),
      };

      // 2. Update the user profile: assign clubId and set role to admin
      await updateUserProfile(profile.id, {
        clubId: clubId,
        role: 'admin',
      });

      // 3. Update local state
      setCurrentClub(club);
      setProfile({ ...profile, clubId: clubId, role: 'admin' });

      // 4. Navigate to dashboard
      router.push('/dashboard');
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Willkommen bei FC Manager!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Erstelle deinen Verein, um loszulegen. Du wirst automatisch als
              Admin eingetragen.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCreateClub} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Input
              id="clubName"
              label="Vereinsname"
              type="text"
              placeholder="z.B. FC Austria Wien Jugend"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
            />

            <Input
              id="city"
              label="Stadt"
              type="text"
              placeholder="z.B. Wien"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <Input
              id="country"
              label="Land"
              type="text"
              placeholder="z.B. Oesterreich"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={loading || !clubName.trim()}
            >
              {loading ? (
                'Verein wird erstellt...'
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  Verein erstellen
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
