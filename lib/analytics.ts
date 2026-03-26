// Specify the GA Measurement ID in .env.local as NEXT_PUBLIC_GA_MEASUREMENT_ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare the gtag property on the window object
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Send an event to Google Analytics dynamically
 */
export const trackEvent = (action: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, params);
  }
};

export const trackPageView = (pagePath: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: pagePath
    });
  }
};

export const AnalyticsEvents = {
  // Triggered when the user hits export PDF
  PDF_DOWNLOAD: 'pdf_download',
  // Triggered when the user hits save or duplicate/draft complete
  FORM_COMPLETE: 'form_complete',
  // Triggered when the user changes template (classic, modern, minimal)
  TEMPLATE_SWITCH: 'template_switch',
  // Triggered when the user changes language (UI interface language)
  LANGUAGE_SWITCH: 'language_switch',
  // Triggered when the user clicks a blog article link
  BLOG_CLICK: 'blog_click',
  // Blog analytics events
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  AD_VISIBLE: 'ad_visible'
};
