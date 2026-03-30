import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="app-card">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white text-2xl font-bold mb-6">
              G
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
            <p className="mt-3 text-base text-slate-600">{t('subtitle')}</p>
          </div>

          <div className="space-y-10 text-base text-slate-600 leading-relaxed">
            <section className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('whatTitle')}</h2>
                  <p className="text-slate-600">{t('whatBody')}</p>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('freeTitle')}</h2>
                  <p className="text-slate-600">{t('freeBody')}</p>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">{t('privacyTitle')}</h2>
                  <p className="text-slate-600">{t('privacyBody')}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 p-6 rounded-xl bg-slate-900 text-white">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-400 mb-2">{t('trustedBy')}</p>
              <p className="text-2xl font-bold">{t('freelancersWorldwide')}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-1">{t('freeToUse')}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-xs text-slate-400 mt-1">{t('signupRequired')}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400 mt-1">{t('browserBased')}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
              {t('createFirstInvoice')}
              <svg className="w-4 h-4 rtl:scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
