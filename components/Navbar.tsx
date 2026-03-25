"use client";

import { useMemo, useState } from 'react';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/i18n/routing';

const supportedLocales = ['en', 'ar', 'fr'] as const;

export default function Navbar() {
  const t = useTranslations('Nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { href: '#how-it-works', label: t('howItWorks') },
      { href: '#features', label: t('features') },
      { href: '#pricing', label: t('pricing') },
      { href: '#faq', label: t('faq') },
      { href: '/blog', label: t('blog') }
    ],
    [t]
  );

  const switchLocale = (nextLocale: (typeof supportedLocales)[number]) => {
    router.replace(
      {
        pathname,
        query: Object.fromEntries(searchParams.entries())
      },
      { locale: nextLocale }
    );
    setLanguageOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border border-white/70 bg-white/72 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-[0.18em] text-white">
            GD
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Global Devis</p>
            <p className="text-xs text-slate-500">{t('brandSubtitle')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith('#') ? (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_8px_20px_rgb(15,23,42,0.04)] transition-colors hover:border-indigo-200 hover:text-slate-950"
              aria-expanded={languageOpen}
            >
              <Globe className="h-4 w-4 text-indigo-600" />
              {locale.toUpperCase()}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {languageOpen ? (
              <div className="absolute inset-inline-end-0 top-[calc(100%+0.75rem)] w-44 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                {supportedLocales.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => switchLocale(entry)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      locale === entry
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span>{t(`localeName.${entry}`)}</span>
                    <span className="text-xs font-semibold uppercase">{entry}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-[0_8px_20px_rgb(15,23,42,0.04)] lg:hidden"
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mx-auto mt-3 max-w-7xl rounded-[28px] border border-white/70 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) =>
              item.href.startsWith('#') ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {supportedLocales.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => switchLocale(entry)}
                className={`rounded-2xl px-3 py-3 text-sm font-medium uppercase transition-colors ${
                  locale === entry
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {entry}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
