'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, Lock, LogOut, Mail, CheckCircle2, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';
import { api } from '@/lib/api';
import FormField, { TextInput } from '@/components/FormField';
import PasswordStrength from '@/components/PasswordStrength';

export default function SettingsPage() {
  const { user, loading: authLoading, logout, refresh } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-24 text-muted">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-7 h-7 text-lime" />
        <h1 className="font-display text-2xl font-bold">Account Settings</h1>
      </div>

      <AccountOverview user={user} refresh={refresh} />
      <ChangeUsernameForm />
      <ChangePasswordForm />
      <LogoutSection logout={logout} router={router} />
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
      <h2 className="font-display font-semibold text-lg flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function AccountOverview({ user, refresh }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification');
      setResent(true);
    } catch (_) {
      // ignore
    } finally {
      setResending(false);
    }
  };

  return (
    <SectionCard title="Account" icon={<User className="w-5 h-5 text-lime" />}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Username</span>
          <span className="font-mono">{user.username}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted">Email</span>
          <span className="font-mono flex items-center gap-2">
            {user.email}
            {user.emailVerified ? (
              <span className="flex items-center gap-1 text-success text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
            ) : (
              <span className="flex items-center gap-1 text-danger text-xs"><AlertCircle className="w-3.5 h-3.5" /> Unverified</span>
            )}
          </span>
        </div>
      </div>
      {!user.emailVerified && (
        <div className="pt-2 border-t border-border">
          {resent ? (
            <p className="text-xs text-success flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Verification email sent — check your inbox.</p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs text-lime hover:underline flex items-center gap-1 disabled:opacity-50"
            >
              {resending && <Loader2 className="w-3 h-3 animate-spin" />}
              Resend verification email
            </button>
          )}
        </div>
      )}
    </SectionCard>
  );
}

function ChangeUsernameForm() {
  const { user, refresh } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.patch('/auth/username', { newUsername, currentPassword });
      setSuccess('Username updated successfully.');
      setNewUsername('');
      setCurrentPassword('');
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Change Username" icon={<User className="w-5 h-5 text-lime" />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{success}</div>}

        <FormField label={`New username (current: ${user.username})`}>
          <TextInput
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="new_username"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
          />
        </FormField>
        <FormField label="Confirm with current password">
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="bg-surface2 border border-border hover:border-lime/40 font-semibold rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update username
        </button>
      </form>
    </SectionCard>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      if (err instanceof ApiError && err.details?.details) {
        setError(err.details.details.join(' '));
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Change Password" icon={<Lock className="w-5 h-5 text-lime" />}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">{error}</div>}
        {success && <div className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-3 py-2">{success}</div>}

        <FormField label="Current password">
          <TextInput
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
          />
        </FormField>
        <FormField label="New password">
          <TextInput
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            required
          />
          <PasswordStrength password={newPassword} />
        </FormField>

        <button
          type="submit"
          disabled={loading}
          className="bg-surface2 border border-border hover:border-lime/40 font-semibold rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update password
        </button>
      </form>
    </SectionCard>
  );
}

function LogoutSection({ logout, router }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    router.push('/');
  };

  return (
    <SectionCard title="Session" icon={<LogOut className="w-5 h-5 text-danger" />}>
      <p className="text-sm text-muted">Log out of PartSniper on this device.</p>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 font-semibold rounded-lg px-4 py-2 text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </SectionCard>
  );
}
