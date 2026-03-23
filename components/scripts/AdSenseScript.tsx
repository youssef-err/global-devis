'use client';
import Script from 'next/script';
import { useCookieConsent } from '@/contexts/cookie-consent-context';

export function AdSenseScript({ publisherId = "ca-pub-0000000000000000" }: { publisherId?: string }) {
  const { consent } = useCookieConsent();
  if (!consent?.ads) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
