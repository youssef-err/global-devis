'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import AuthForm from '@/components/ui/AuthForm';

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
    <AuthForm
      mode="signup"
      email={email}
      password={password}
      error={error}
      loading={loading}
      message={message}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
    />
  );
}
