'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/lib/analytics';
import { useCookieConsent } from '@/contexts/cookie-consent-context';

interface ScrollDepthConfig {
  thresholds?: number[];
  throttleMs?: number;
}

interface TimeOnPageConfig {
  reportIntervalMs?: number;
}

interface AdVisibilityConfig {
  checkIntervalMs?: number;
  visibilityThreshold?: number;
}

interface AdvancedAnalyticsConfig {
  scrollDepth?: ScrollDepthConfig;
  timeOnPage?: TimeOnPageConfig;
  adVisibility?: AdVisibilityConfig;
  enabled?: boolean;
}

const defaultConfig: Required<AdvancedAnalyticsConfig> = {
  scrollDepth: { thresholds: [25, 50, 75, 90, 100], throttleMs: 500 },
  timeOnPage: { reportIntervalMs: 30000 },
  adVisibility: { checkIntervalMs: 2000, visibilityThreshold: 0.5 },
  enabled: true
};

export function useScrollDepthTracking(config: ScrollDepthConfig = {}) {
  const { consent } = useCookieConsent();
  const triggeredDepths = useRef<Set<number>>(new Set());
  const lastScrollY = useRef(0);
  const lastThrottleTime = useRef(0);

  const handleScroll = useCallback(() => {
    if (!consent?.analytics) return;
    
    const now = Date.now();
    const throttleMs = config.throttleMs ?? 500;
    
    if (now - lastThrottleTime.current < throttleMs) return;
    lastThrottleTime.current = now;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    
    const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
    const thresholds = config.thresholds ?? [25, 50, 75, 90, 100];
    
    for (const threshold of thresholds) {
      if (scrollPercent >= threshold && !triggeredDepths.current.has(threshold)) {
        triggeredDepths.current.add(threshold);
        trackEvent('scroll_depth', {
          depth_percent: threshold,
          page_path: window.location.pathname
        });
      }
    }
    
    lastScrollY.current = window.scrollY;
  }, [consent?.analytics, config]);

  useEffect(() => {
    if (!consent?.analytics) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [consent?.analytics, handleScroll]);
}

export function useTimeOnPageTracking(config: TimeOnPageConfig = {}) {
  const { consent } = useCookieConsent();
  const startTime = useRef(0);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const reportTime = useCallback((reason: 'interval' | 'unload', seconds: number) => {
    if (!consent?.analytics) return;
    
    trackEvent('time_on_page', {
      seconds: Math.round(seconds),
      report_type: reason,
      page_path: window.location.pathname
    });
  }, [consent?.analytics]);

  useEffect(() => {
    if (!consent?.analytics) return;
    
    startTime.current = Date.now();
    
    const reportIntervalMs = config.reportIntervalMs ?? 30000;
    intervalId.current = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      reportTime('interval', elapsed);
    }, reportIntervalMs);
    
    const handleUnload = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      reportTime('unload', elapsed);
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      if (intervalId.current) clearInterval(intervalId.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [consent?.analytics, config.reportIntervalMs, reportTime]);

  return {
    getElapsedTime: () => (Date.now() - startTime.current) / 1000
  };
}

export function useAdVisibilityTracking(config: AdVisibilityConfig = {}) {
  const { consent } = useCookieConsent();
  const visibleAds = useRef<Set<string>>(new Set());
  const reportedAds = useRef<Set<string>>(new Set());

  const checkAdVisibility = useCallback(() => {
    if (!consent?.ads) return;
    
    const ads = document.querySelectorAll('.adsbygoogle, ins[data-ad-slot]');
    
    ads.forEach((ad) => {
      const slot = ad.getAttribute('data-ad-slot');
      if (!slot) return;
      
      const rect = ad.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        rect.width > 0 &&
        rect.height > 0
      );
      
      if (isVisible && !visibleAds.current.has(slot)) {
        visibleAds.current.add(slot);
        
        if (!reportedAds.current.has(slot)) {
          reportedAds.current.add(slot);
          trackEvent('ad_visible', {
            ad_slot: slot,
            page_path: window.location.pathname
          });
        }
      }
    });
  }, [consent?.ads]);

  useEffect(() => {
    if (!consent?.ads) return;
    
    const checkIntervalMs = config.checkIntervalMs ?? 2000;
    const intervalId = setInterval(checkAdVisibility, checkIntervalMs);
    
    checkAdVisibility();
    
    return () => clearInterval(intervalId);
  }, [consent?.ads, config.checkIntervalMs, checkAdVisibility]);
}

export function useAdvancedAnalyticsTracking(fullConfig: AdvancedAnalyticsConfig = {}) {
  const config = {
    scrollDepth: { ...defaultConfig.scrollDepth, ...fullConfig.scrollDepth },
    timeOnPage: { ...defaultConfig.timeOnPage, ...fullConfig.timeOnPage },
    adVisibility: { ...defaultConfig.adVisibility, ...fullConfig.adVisibility },
    enabled: fullConfig.enabled ?? true
  };
  
  useScrollDepthTracking(config.scrollDepth);
  useTimeOnPageTracking(config.timeOnPage);
  useAdVisibilityTracking(config.adVisibility);
}

export default function AdvancedAnalyticsProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config?: AdvancedAnalyticsConfig;
}) {
  useAdvancedAnalyticsTracking(config ?? {});
  return (
    <>
      {children}
    </>
  );
}
