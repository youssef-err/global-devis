"use client";

import { useMemo, useState } from 'react';
import { ChevronDown, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

const supportedLocales = routing.locales;

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
      { href: '#top', label: t('home') },
      { href: '#features', label: t('features') },
      { href: '#pricing', label: t('pricing') },
      { href: '#faq', label: t('faq') }
    ],
    [t]
  );

  const switchLocale = (nextLocale: string) => {
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
      <div className="mx-auto flex max-w-5xl items-center justify-between rounded-[2rem] border border-white/80 bg-white/75 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-md sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-[0.18em] text-white">
            GD
          </div>
          <div className="font-arabic">
            <p className="text-sm font-bold text-slate-950">{t('brand')}</p>
            <p className="text-xs text-slate-500">{t('brandSubtitle')}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 font-arabic lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition-colors hover:border-indigo-200 hover:text-slate-950"
              aria-expanded={languageOpen}
            >
              <Globe className="h-4 w-4 text-indigo-600" />
              {locale.toUpperCase()}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {languageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-inline-end-0 top-[calc(100%+0.75rem)] w-44 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-md"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-3 max-w-5xl rounded-[2rem] border border-white/80 bg-white/92 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-md lg:hidden"
          >
            <nav className="flex flex-col gap-2 font-arabic">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {item.label}
                </a>
              ))}
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
