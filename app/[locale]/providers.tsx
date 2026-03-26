'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';
import { AdSenseScript } from '@/components/scripts/AdSenseScript';
import { GoogleAnalyticsScript } from '@/components/scripts/GoogleAnalyticsScript';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GoogleAnalyticsScript />
      <AdSenseScript />
      <AnalyticsTracker />
      {children}
    </AuthProvider>
  );
}
