'use client';

import { useState } from 'react';
import type { SyncStatus } from '@/hooks/useInvoiceSync';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics';
import { useTranslations } from 'next-intl';
import DonationModal from '@/components/ui/DonationModal';

interface TopBarProps {
  lang: 'ar' | 'en';
  onChangeLang: (lang: 'ar' | 'en') => void;
  onSave: () => void;
  onReset: () => void;
  onDuplicate: () => void;
  onLogout: () => void;
  savedFlash?: boolean;
  userEmail?: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  syncError: string | null;
}

const syncDot: Record<SyncStatus, string> = {
  idle:    'bg-emerald-400',
  syncing: 'bg-amber-400',
  offline: 'bg-slate-300',
  error:   'bg-red-400',
};

export default function TopBar({
  lang,
  onChangeLang,
  onSave,
  onReset,
  onDuplicate,
  onLogout,
  savedFlash,
  userEmail,
  syncStatus,
  syncError,
}: TopBarProps) {
  const t = useTranslations('TopBar');
  const [donateOpen, setDonateOpen] = useState(false);
  const syncText: Record<SyncStatus, string> = {
    idle: t('sync.idle'),
    syncing: t('sync.syncing'),
    offline: t('sync.offline'),
    error: t('sync.error')
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-6">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[11px] font-bold text-white tracking-wide select-none">
            GD
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{t('brand')}</span>
            {savedFlash && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                {t('saved')}
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          {/* Sync indicator */}
          <div className="flex items-center gap-1.5 me-2">
            <span className={`h-1.5 w-1.5 rounded-full ${syncDot[syncStatus]}`} />
            <span className="hidden text-xs text-slate-400 sm:inline">{syncText[syncStatus]}</span>
            {syncError && <span className="hidden text-xs text-red-500 sm:inline">· {syncError}</span>}
          </div>

          {/* User email */}
          {userEmail && (
            <span className="hidden max-w-[160px] truncate text-xs text-slate-400 sm:inline me-1" title={userEmail}>
              {userEmail}
            </span>
          )}

          {/* Lang toggle */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 me-1">
            {(['ar', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { onChangeLang(l); trackEvent(AnalyticsEvents.LANGUAGE_SWITCH, { lang: l }); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  lang === l
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Support button */}
          <button
            type="button"
            onClick={() => setDonateOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <span aria-hidden="true">❤️</span>
            <span className="hidden md:inline font-medium">{t('supportCta')}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('reset')}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('duplicate')}
          </button>

          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            {t('save')}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      </div>
      <DonationModal open={donateOpen} onClose={() => setDonateOpen(false)} />
    </header>
  );
}
