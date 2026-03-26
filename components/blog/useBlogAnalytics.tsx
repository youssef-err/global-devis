'use client';

import { useEffect, useRef } from 'react';
import { useCookieConsent } from '@/contexts/cookie-consent-context';

const THROTTLE_MS = 500;
const AD_CHECK_INTERVAL_MS = 2000;
const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 90, 100];
const TIME_REPORT_INTERVAL_MS = 30000;

export function useBlogAnalytics() {
  const { consent } = useCookieConsent();
  const triggeredScrollDepthsRef = useRef<Set<number>>(new Set());
  const reportedAdsRef = useRef<Set<string>>(new Set());
  const lastScrollTimeRef = useRef(0);
  const pageStartTimeRef = useRef<number>(0);
  const reportIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!consent?.analytics && !consent?.ads) return;

    pageStartTimeRef.current = Date.now();

    const trackScrollDepth = () => {
      if (!consent?.analytics) return;
      
      const now = Date.now();
      if (now - lastScrollTimeRef.current < THROTTLE_MS) return;
      lastScrollTimeRef.current = now;
      
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      
      SCROLL_DEPTH_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !triggeredScrollDepthsRef.current.has(threshold)) {
          triggeredScrollDepthsRef.current.add(threshold);
          window.gtag?.('event', 'scroll_depth', {
            depth_percent: threshold,
            page_path: window.location.pathname
          });
        }
      });
    };

    const trackTimeOnPage = (reason: 'interval' | 'unload') => {
      if (!consent?.analytics) return;
      
      const seconds = Math.round((Date.now() - pageStartTimeRef.current) / 1000);
      window.gtag?.('event', 'time_on_page', {
        seconds,
        report_type: reason,
        page_path: window.location.pathname
      });
    };

    const checkAdVisibility = () => {
      if (!consent?.ads) return;
      
      const ads = document.querySelectorAll('ins[data-ad-slot]');
      
      ads.forEach((ad) => {
        const slot = ad.getAttribute('data-ad-slot');
        if (!slot || reportedAdsRef.current.has(slot)) return;
        
        const rect = ad.getBoundingClientRect();
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) &&
          rect.width > 0 &&
          rect.height > 0
        );
        
        if (isVisible) {
          reportedAdsRef.current.add(slot);
          window.gtag?.('event', 'ad_visible', {
            ad_slot: slot,
            page_path: window.location.pathname
          });
        }
      });
    };

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    reportIntervalRef.current = setInterval(() => trackTimeOnPage('interval'), TIME_REPORT_INTERVAL_MS);
    
    const adCheckInterval = setInterval(checkAdVisibility, AD_CHECK_INTERVAL_MS);
    checkAdVisibility();

    const handleUnload = () => trackTimeOnPage('unload');
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', handleUnload);
      if (reportIntervalRef.current) clearInterval(reportIntervalRef.current);
      clearInterval(adCheckInterval);
    };
  }, [consent]);
}
