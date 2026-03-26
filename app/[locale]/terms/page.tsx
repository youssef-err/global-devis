import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal.terms' });
  
  return {
    title: `${t('title')} | Global Devis`,
    description: 'Terms and conditions for using our free invoice generator.',
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Legal.terms' });
  const tFooter = await getTranslations({ locale, namespace: 'Footer' });
  
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-4xl app-card">
        <h1 className="text-3xl font-semibold text-slate-900 mb-8">{t('title')}</h1>
        
        <div className="prose prose-slate max-w-none text-slate-600">
          <p><strong>{t('lastUpdated')}:</strong> March 2026</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section1Title')}</h2>
          <p>{t('section1Body')}</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section2Title')}</h2>
          <p>{t('section2Body')}</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section3Title')}</h2>
          <p>{t('section3Body')}</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section4Title')}</h2>
          <p>{t('section4Body')}</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section5Title')}</h2>
          <p>{t('section5Body')}</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">{t('section6Title')}</h2>
          <p>
            {t('section6Body')} <a className="text-indigo-600 hover:underline" href="mailto:support@globaldevis.app">{tFooter('contactEmail')}</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
