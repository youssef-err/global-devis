'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const { error: err } = await signUp(email, password, locale);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setMessage(t('signupSuccess'));
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">{t('signUp')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('signUpDesc')}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-slate-600">{t('email')}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 hover:border-slate-300"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-slate-600">{t('password')}</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 hover:border-slate-300"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            {loading ? t('creatingAccount') : t('signUpButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {t('hasAccount')}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-slate-900 underline">
            {t('signInButton')}
          </Link>
        </p>
      </div>
    </div>
  );
}
