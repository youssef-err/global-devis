'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface AuthFormProps {
  mode: 'login' | 'signup';
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
  message?: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthForm({
  mode,
  email,
  password,
  error,
  loading,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthFormProps) {
  const locale = useLocale();
  const t = useTranslations('Auth');

  const isLogin = mode === 'login';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          {isLogin ? t('signIn') : t('signUp')}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isLogin ? t('signInDesc') : t('signUpDesc')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-slate-600">{t('email')}</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 hover:border-slate-300"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-slate-600">{t('password')}</span>
            <input
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              {...(!isLogin ? { minLength: 6 } : {})}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
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
            {isLogin
              ? loading ? t('signingIn') : t('signInButton')
              : loading ? t('creatingAccount') : t('signUpButton')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? t('noAccount') : t('hasAccount')}{' '}
          <Link
            href={isLogin ? `/${locale}/signup` : `/${locale}/login`}
            className="font-medium text-slate-900 underline"
          >
            {isLogin ? t('signUpButton') : t('signInButton')}
          </Link>
        </p>
      </div>
    </div>
  );
}
