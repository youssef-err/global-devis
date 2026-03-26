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
  labelText?: string;
}

export default function AdSenseUnit({ 
  slot, 
  format = 'auto', 
  responsive = true, 
  className = '', 
  style,
  showLabel: _showLabel = true,
  minHeight = 110,
  labelText = 'Recommended'
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

  const getContainerHeight = () => {
    if (format === 'rectangle') return 250;
    return minHeight;
  };

  if (!consent?.ads) {
    return (
      <div className="my-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-[12px] text-slate-500 font-medium">{labelText}</span>
          </div>
          <span className="text-[11px] text-slate-400">Sponsored</span>
        </div>
        <div 
          className={`bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center rounded-2xl border border-slate-200/80 shadow-sm ${className}`} 
          style={{ minHeight: `${getContainerHeight()}px` }}
          aria-hidden="true"
        >
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-slate-200/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-xs text-slate-400">Ad space</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-[12px] text-slate-500 font-medium">{labelText}</span>
        </div>
        <span className="text-[11px] text-slate-400">Sponsored</span>
      </div>
      <div 
        className={`rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden ${className}`}
        style={{ 
          minHeight: `${getContainerHeight()}px`,
          maxHeight: format === 'rectangle' ? '250px' : '150px'
        }}
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
  );
}
