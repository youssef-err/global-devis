import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-900">{t('brand')}</span>
          <span className="mx-2 text-slate-300">•</span>
          <span>{t('tagline')}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link href="/about" className="text-slate-500 hover:text-slate-900 transition-colors">
            {t('about')}
          </Link>
          <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">
            {t('privacy')}
          </Link>
          <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">
            {t('terms')}
          </Link>
          <a
            href={`mailto:${t('contactEmail')}`}
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            {t('contact')}
          </a>
        </nav>
      </div>
    </footer>
  );
}

