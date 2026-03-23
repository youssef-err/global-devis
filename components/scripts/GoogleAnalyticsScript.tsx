'use client';
import Script from 'next/script';
import { useCookieConsent } from '@/contexts/cookie-consent-context';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';

export function GoogleAnalyticsScript() {
  const { consent } = useCookieConsent();
  if (!consent?.analytics || !GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
