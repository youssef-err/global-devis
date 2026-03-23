import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from './providers';
import { Metadata } from 'next';
import { CookieConsentProvider } from '@/contexts/cookie-consent-context';
import { ToastProvider } from '@/contexts/toast-context';
import { GoogleAnalyticsScript } from '@/components/scripts/GoogleAnalyticsScript';
import { AdSenseScript } from '@/components/scripts/AdSenseScript';
import CookieBanner from '@/components/gdpr/CookieBanner';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  // Use metadata directly or load translations if needed
  // Since we don't have direct access to messages here easily without await getMessages() 
  // Let's load the messages first:
  const messages: any = await getMessages({ locale });
  const t = messages.HomePage;
  
  const languages = routing.locales.reduce((acc: Record<string, string>, l) => {
    acc[l] = `/${l}`;
    return acc;
  }, {});
  
  return {
    title: t?.seoTitle || "Global Devis",
    description: t?.seoDescription || "Invoice Generator",
    keywords: t?.seoKeywords || "invoice, generator, free",
    alternates: {
      canonical: `/${locale}`,
      languages: languages,
    }
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

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans bg-slate-50`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ToastProvider>
            <CookieConsentProvider>
              <Providers>{children}</Providers>
              <CookieBanner />
              <GoogleAnalyticsScript />
              <AdSenseScript />
            </CookieConsentProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}