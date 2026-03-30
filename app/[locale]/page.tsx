import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import InvoiceFormLazy from '@/components/invoice/InvoiceFormLazy';
import Navbar from '@/components/layout/Navbar';
import PremiumSection from '@/components/ui/PremiumSection';
import { Link } from '@/i18n/routing';
import SiteFooter from '@/components/layout/SiteFooter';
import AdSenseUnit from '@/components/ads/AdSenseUnit';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('heroTitle'),
    description: t('heroDescription')
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Invoice Form Section */}
      <section className="px-4 pb-10 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <InvoiceFormLazy />
        </div>
      </section>

      {/* Ad Section - After Form */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-50 px-4 text-xs text-slate-500 font-medium">{t('continueBelow')}</span>
            </div>
          </div>
          <AdSenseUnit slot="3344556677" format="auto" style={{ minHeight: '110px' }} labelText={t('toolsForFreelancers')} />
        </div>
      </section>

      {/* How It Works Section */}
      <PremiumSection id="how-it-works" className="section-anchor px-4 py-20 sm:px-6" delay={0.1}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('howItWorksTitle')}
            </h2>
            <p className="mt-4 text-base text-slate-600">
              {t('howItWorksIntro')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="app-card group hover:scale-[1.02] transition-transform duration-500"
              >
                <div className="feature-icon mb-6 bg-slate-900 text-white">
                  <span className="text-lg font-bold">0{step}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`step${step}Title` as any)}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`step${step}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PremiumSection>

      {/* Benefits Banner */}
      <PremiumSection className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="app-card text-center bg-slate-900 text-white border-slate-800 shadow-2xl shadow-indigo-500/10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('benefitsTitle')}
            </h2>
            <p className="mt-5 max-w-3xl mx-auto text-base leading-relaxed text-slate-400">
              {t('benefitsDesc')}
            </p>
          </div>
        </div>
      </PremiumSection>

      {/* Ad Section - After Benefits */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <AdSenseUnit slot="8899001122" format="auto" style={{ minHeight: '110px' }} labelText={t('popularThisWeek')} />
        </div>
      </section>

      {/* Pricing Section */}
      <PremiumSection id="pricing" className="section-anchor px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('pricingTitle')}
            </h2>
            <p className="mt-4 text-base text-slate-600">
              {t('pricingIntro')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Starter Plan */}
            <div className="app-card hover:shadow-xl transition-shadow duration-500">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                {t('pricingStarterTitle')}
              </p>
              <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900">
                {t('pricingStarterPrice')}
              </p>
              <p className="mt-4 text-slate-600">
                {t('pricingStarterDesc')}
              </p>
              <Link href={`/${locale}`} className="mt-8 app-btn app-btn-secondary w-full">
                {t('getStarted')}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative app-card bg-slate-900 border-slate-700 shadow-2xl shadow-indigo-500/20 hover:scale-[1.01] transition-transform duration-500">
              <div className="absolute -top-3 end-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-semibold text-white rounded-full shadow-lg">
                {t('popularBadge')}
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                {t('pricingProTitle')}
              </p>
              <p className="mt-6 text-5xl font-bold tracking-tight text-white">
                {t('pricingProPrice')}
              </p>
              <p className="mt-4 text-slate-400">
                {t('pricingProDesc')}
              </p>
              <Link href={`/${locale}`} className="mt-8 app-btn app-btn-primary w-full shadow-lg shadow-indigo-500/40">
                {t('getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </PremiumSection>

      {/* FAQ Section */}
      <PremiumSection id="faq" className="section-anchor px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('faqTitle')}
            </h2>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((faq) => (
              <details
                key={faq}
                className="app-card group cursor-pointer hover:border-slate-300 transition-colors"
              >
                <summary className="flex items-center justify-between gap-4 text-lg font-semibold text-slate-900 list-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <span>{t(`faq${faq}Q` as any)}</span>
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 group-open:bg-indigo-100 group-open:text-indigo-600 transition-colors">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:block">−</span>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-slate-600">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {t(`faq${faq}A` as any)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </PremiumSection>

      {/* Blog Section */}
      <PremiumSection id="blog" className="section-anchor px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t('recentArticlesTitle')}
              </h2>
            </div>
            <Link href="/blog" locale={locale} className="hidden sm:inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              {t('viewAllBlogPosts')}
              <svg className="w-4 h-4 rtl:scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { slug: 'how-to-make-invoice', title: t('article1Title'), excerpt: t('article1Excerpt') },
              { slug: 'best-invoicing-practices', title: t('article2Title'), excerpt: t('article2Excerpt') },
              { slug: 'managing-cash-flow', title: t('article3Title'), excerpt: t('article3Excerpt') }
            ].map((article) => (
              <article
                key={article.slug}
                className="app-card group cursor-pointer hover:shadow-xl transition-all duration-500"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  <Link href={`/blog/${article.slug}`} locale={locale}>
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                  <span>{t('readMore')}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/blog" locale={locale} className="app-btn app-btn-secondary">
              {t('viewAllBlogPosts')}
            </Link>
          </div>
        </div>
      </PremiumSection>

      <SiteFooter />
    </main>
  );
}
