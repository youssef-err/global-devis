import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function SiteFooter() {
  const t = useTranslations('Footer');

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-bold">
                G
              </div>
              <span className="text-lg font-semibold text-slate-900">{t('brand')}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              {t('tagline')}
            </p>
            <p className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure & private by default
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Product</h3>
            <nav className="space-y-3 text-sm">
              <Link href="/about" className="block text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link href="/blog" className="block text-slate-600 hover:text-slate-900 transition-colors">
                Blog
              </Link>
              <Link href="/#pricing" className="block text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Legal</h3>
            <nav className="space-y-3 text-sm">
              <Link href="/privacy" className="block text-slate-600 hover:text-slate-900 transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/terms" className="block text-slate-600 hover:text-slate-900 transition-colors">
                {t('terms')}
              </Link>
              <a
                href={`mailto:${t('contactEmail')}`}
                className="block text-slate-600 hover:text-slate-900 transition-colors"
              >
                {t('contact')}
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} {t('brand')}. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Made for freelancers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}

