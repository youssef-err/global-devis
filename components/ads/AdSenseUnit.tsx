'use client';
import { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/cookie-consent-context';

interface AdSenseUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showLabel?: boolean;
  minHeight?: number;
}

export default function AdSenseUnit({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '', 
  style,
  showLabel = true,
  minHeight = 110
}: AdSenseUnitProps) {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent?.ads) {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error', err);
      }
    }
  }, [consent?.ads]);

  const wrapperClasses = format === 'rectangle' 
    ? 'my-8 py-4' 
    : 'my-6 py-3';

  const getContainerHeight = () => {
    if (format === 'rectangle') return 250;
    return minHeight;
  };

  if (!consent?.ads) {
    return (
      <div className={wrapperClasses}>
        {showLabel && (
          <span className="block text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Sponsored</span>
        )}
        <div 
          className={`bg-slate-50 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl ${className}`} 
          style={{ minHeight: `${getContainerHeight()}px` }}
          aria-hidden="true"
        >
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      {showLabel && (
        <span className="block text-[11px] text-slate-400 uppercase tracking-wide mb-1.5">Sponsored</span>
      )}
      <div 
        className={`rounded-xl border border-slate-200 bg-white overflow-hidden ${className}`}
        style={{ 
          minHeight: `${getContainerHeight()}px`,
          maxHeight: format === 'rectangle' ? '250px' : '150px'
        }}
      >
        <div 
          className="relative w-full h-full"
          style={{ minHeight: `${getContainerHeight()}px` }}
        >
          <ins
            className="adsbygoogle"
            style={{ 
              display: 'block', 
              width: '100%', 
              minHeight: `${getContainerHeight()}px`,
              ...style 
            }}
            data-ad-client="ca-pub-0000000000000000"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        </div>
      </div>
    </div>
  );
}
