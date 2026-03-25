import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';
import { CookieConsentProvider } from '@/contexts/cookie-consent-context';
import { ToastProvider } from '@/contexts/toast-context';

const appFont = localFont({
  src: [
    {
      path: '../../public/fonts/Poppins-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../public/fonts/Poppins-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-inter',
  display: 'swap'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('heroTitle'),
    description: t('heroDescription')
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${appFont.variable} font-sans bg-slate-50`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ToastProvider>
            <CookieConsentProvider>
              <Providers>{children}</Providers>
            </CookieConsentProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
