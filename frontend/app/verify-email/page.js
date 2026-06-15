'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((d) => {
        setStatus('success');
        setMessage(d.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-lime mx-auto animate-spin" />
          <h1 className="font-display text-2xl font-bold">Verifying your email...</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
          <h1 className="font-display text-2xl font-bold">Email verified!</h1>
          <p className="text-muted">{message}</p>
          <Link href="/" className="inline-block bg-lime text-ink font-semibold rounded-lg px-5 py-2.5 hover:bg-limeDark transition-colors">
            Go to dashboard
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-danger mx-auto" />
          <h1 className="font-display text-2xl font-bold">Verification failed</h1>
          <p className="text-muted">{message}</p>
          <Link href="/settings" className="inline-block bg-surface border border-border rounded-lg px-5 py-2.5 hover:border-lime/40 transition-colors">
            Go to settings
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-lime" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
