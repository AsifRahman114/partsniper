'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crosshair, User, Lock, Loader2 } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';
import FormField, { TextInput } from '@/components/FormField';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-8">
        <Crosshair className="w-10 h-10 text-lime mb-3" strokeWidth={2.5} />
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="text-muted text-sm mt-1">Log in to track deals and save your builds.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-border rounded-2xl p-6">
        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <FormField label="Username or email">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <TextInput
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="username or you@example.com"
              className="pl-9"
              required
              autoFocus
            />
          </div>
        </FormField>

        <FormField label="Password">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="pl-9"
              required
            />
          </div>
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime text-ink font-semibold rounded-lg py-2.5 hover:bg-limeDark transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Log in
        </button>

        <p className="text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link href="/signup" className="text-lime hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
