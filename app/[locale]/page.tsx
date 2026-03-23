import Link from 'next/link';
import InvoiceFormLazy from '@/components/InvoiceFormLazy';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import { useTranslations } from 'next-intl';

export default function HomePage({ params }: { params: { locale: string } }) {
  const t = useTranslations('HomePage');
  const locale = params.locale || 'en';
  
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="bg-white py-12 px-4 shadow-sm text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">{t('heroTitle')}</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">{t('heroDescription')}</p>
        </div>
      </section>

      {/* AdSense Top Slot */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-6">
        <AdSenseUnit slot="1234567890" style={{ minHeight: '90px' }} />
      </div>

      {/* Main Tool */}
      <section className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Heavy client-side interactive tool explicitly deferred behind the lazy boundary */}
          <div className="flex flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <InvoiceFormLazy />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 px-4 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">{t('howItWorksTitle')}</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">{t('howItWorksIntro')}</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{t('step1Title')}</h3>
              <p className="text-slate-600">{t('step1Desc')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{t('step2Title')}</h3>
              <p className="text-slate-600">{t('step2Desc')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">{t('step3Title')}</h3>
              <p className="text-slate-600">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Mid Slot */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-8 mb-4">
        <AdSenseUnit slot="0987654321" format="fluid" style={{ minHeight: '120px' }} />
      </div>

      {/* Benefits Section */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">{t('benefitsTitle')}</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
             <p className="text-lg text-slate-600 max-w-4xl mx-auto leading-relaxed">{t('benefitsDesc')}</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">{t('faqTitle')}</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{t('faq1Q')}</h4>
              <p className="text-slate-600 leading-relaxed">{t('faq1A')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{t('faq2Q')}</h4>
              <p className="text-slate-600 leading-relaxed">{t('faq2A')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{t('faq3Q')}</h4>
              <p className="text-slate-600 leading-relaxed">{t('faq3A')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{t('faq4Q')}</h4>
              <p className="text-slate-600 leading-relaxed">{t('faq4A')}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg shadow-sm border border-slate-100">
              <h4 className="text-lg font-bold text-slate-800 mb-2">{t('faq5Q')}</h4>
              <p className="text-slate-600 leading-relaxed">{t('faq5A')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles & Blog Link Section */}
      <section className="bg-slate-50 py-16 px-4 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-bold text-slate-800">{t('recentArticlesTitle')}</h2>
            <Link href={`/${locale}/blog`} className="text-indigo-600 font-semibold hover:underline">
               {t('viewAllBlogPosts')} &rarr;
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3 group-hover:underline">
                <Link href={`/${locale}/blog/how-to-make-invoice`}>{t('article1Title')}</Link>
              </h4>
              <p className="text-slate-600">{t('article1Excerpt')}</p>
            </div>
            <div className="group cursor-pointer bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3 group-hover:underline">
                <Link href={`/${locale}/blog/how-to-make-invoice`}>{t('article2Title')}</Link>
              </h4>
              <p className="text-slate-600">{t('article2Excerpt')}</p>
            </div>
            <div className="group cursor-pointer bg-white p-6 rounded-xl shadow-sm">
              <h4 className="text-xl font-semibold text-indigo-600 mb-3 group-hover:underline">
                <Link href={`/${locale}/blog/how-to-make-invoice`}>{t('article3Title')}</Link>
              </h4>
              <p className="text-slate-600">{t('article3Excerpt')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}