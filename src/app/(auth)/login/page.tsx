'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Play } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { enableDemoMode } from '@/lib/demo-data';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show error if redirected from auth callback failure
  const callbackError = searchParams.get('error');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          setError('Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.');
        } else if (authError.message === 'Email not confirmed') {
          setError('E-Mail noch nicht bestätigt. Bitte prüfe dein Postfach.');
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin() {
    enableDemoMode();
    router.push('/dashboard');
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">FC Manager</h1>
          <p className="mt-1 text-sm text-gray-500">
            Melde dich in deinem Konto an
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {(error || callbackError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error ||
                (callbackError === 'auth_callback_failed'
                  ? 'Authentifizierung fehlgeschlagen. Bitte versuche es erneut.'
                  : 'Ein Fehler ist aufgetreten.')}
            </div>
          )}

          <Input
            id="email"
            label="E-Mail-Adresse"
            type="email"
            placeholder="max@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="password"
            label="Passwort"
            type="password"
            placeholder="Dein Passwort eingeben"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Anmeldung...' : 'Anmelden'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">ODER</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Demo Login */}
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          size="lg"
          onClick={handleDemoLogin}
        >
          <Play className="h-4 w-4" />
          Demo Login
        </Button>
        <p className="mt-2 text-center text-xs text-gray-400">
          App mit Beispieldaten erkunden — kein Konto nötig
        </p>

        <p className="mt-6 text-center text-sm text-gray-500">
          Noch kein Konto?{' '}
          <Link
            href="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
