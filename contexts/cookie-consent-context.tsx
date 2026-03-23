'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ConsentSettings = {
  analytics: boolean;
  ads: boolean;
};

interface CookieConsentContextType {
  consent: ConsentSettings | null; // null if banner hasn't been engaged yet
  hasEngaged: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  openSettings: () => void;
  isSettingsOpen: boolean;
  savePreferences: (settings: ConsentSettings) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentSettings | null>(null);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = window.localStorage.getItem('gdpr_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        setConsent(parsed);
        setHasEngaged(true);
      }
    } catch {}
  }, []);

  const saveToStorage = (settings: ConsentSettings) => {
    try {
      window.localStorage.setItem('gdpr_consent', JSON.stringify(settings));
      setConsent(settings);
      setHasEngaged(true);
      setIsSettingsOpen(false);
    } catch {}
  };

  const acceptAll = () => saveToStorage({ analytics: true, ads: true });
  const rejectAll = () => saveToStorage({ analytics: false, ads: false });
  const openSettings = () => setIsSettingsOpen(true);
  const savePreferences = (settings: ConsentSettings) => saveToStorage(settings);

  // Render context safely even on SSR, UI reacts to `consent === null` or `isMounted` natively inside children.
  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasEngaged,
        acceptAll,
        rejectAll,
        openSettings,
        isSettingsOpen,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
