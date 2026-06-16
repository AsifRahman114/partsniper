'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Crosshair, Mail, User, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';
import FormField, { TextInput } from '@/components/FormField';
import PasswordStrength from '@/components/PasswordStrength';

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { message } = await signup(username, email, password);
      setSuccess(message);
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.details) {
          setErrors({ password: err.details.details.join(' ') });
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
        <h1 className="font-display text-2xl font-bold">Welcome to PartSniper!</h1>
        <p className="text-muted">{success}</p>
        <p className="text-sm text-muted">Redirecting you to the dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="flex flex-col items-center mb-8">
        <Crosshair className="w-10 h-10 text-lime mb-3" strokeWidth={2.5} />
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="text-muted text-sm mt-1">Start sniping the best PC part deals.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-border rounded-2xl p-6">
        {errors.form && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {errors.form}
          </div>
        )}

        <FormField label="Username">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <TextInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. asif_cse"
              className="pl-9"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="3-20 characters: letters, numbers, underscores only"
            />
          </div>
          <p className="text-xs text-muted">3-20 characters: letters, numbers, underscores only.</p>
        </FormField>

        <FormField label="Email" error={errors.email}>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9"
              required
              error={errors.email}
            />
          </div>
          <p className="text-xs text-muted">We'll send a verification link — please use a real address.</p>
        </FormField>

        <FormField label="Password" error={errors.password}>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              className="pl-9"
              required
              error={errors.password}
            />
          </div>
          <PasswordStrength password={password} />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime text-ink font-semibold rounded-lg py-2.5 hover:bg-limeDark transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-lime hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
