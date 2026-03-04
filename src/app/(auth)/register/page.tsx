'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Create your account
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-700">
              <p className="font-medium">Registration successful!</p>
              <p className="mt-1">
                Please check your email to confirm your account before signing in.
              </p>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Already confirmed?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Input
                id="fullName"
                label="Full name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />

              <Input
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
