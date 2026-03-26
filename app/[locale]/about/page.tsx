import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

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
          <h1 className="text-2xl font-semibold text-slate-900">{t('title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('subtitle')}</p>

          <div className="mt-8 space-y-6 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-slate-900">{t('whatTitle')}</h2>
              <p className="mt-2">{t('whatBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">{t('freeTitle')}</h2>
              <p className="mt-2">{t('freeBody')}</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-slate-900">{t('privacyTitle')}</h2>
              <p className="mt-2">{t('privacyBody')}</p>
            </section>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {t('trustLine')}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

