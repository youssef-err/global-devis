'use client';
import { useCookieConsent } from '@/contexts/cookie-consent-context';
import Link from 'next/link';

export default function CookieBanner() {
  const { hasEngaged, acceptAll, rejectAll } = useCookieConsent();

  if (hasEngaged) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white p-4 shadow-2xl sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex-1 text-sm text-slate-600">
          <p>
            We use cookies to personalize content and ads, to provide social media features, and to analyze our traffic. 
            We also share information about your use of our site with our advertising and analytics partners who may combine it with other information that you’ve provided to them or that they’ve collected from your use of their services. 
            Read our <Link href="/en/privacy" className="font-semibold text-indigo-600 hover:text-indigo-500">Privacy Policy</Link> for details.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            onClick={rejectAll}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:flex-none"
          >
            Reject All
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 sm:flex-none"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
