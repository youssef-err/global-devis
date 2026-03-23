'use client';
import { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/cookie-consent-context';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSenseUnit({ slot, format = 'auto', responsive = true, className = '', style }: AdSenseUnitProps) {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent?.ads) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error', err);
      }
    }
  }, [consent?.ads]);

  // If no consent, render empty box to preserve layout explicitly (helps maintain strict CLS parameters)
  if (!consent?.ads) {
     return <div className={`bg-slate-50 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 ${className}`} style={style}>Advertisement Placeholder</div>;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-0000000000000000"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
