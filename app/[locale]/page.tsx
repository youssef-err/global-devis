import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import InvoiceFormLazy from '@/components/InvoiceFormLazy';
import Navbar from '@/components/Navbar';
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
    <main className="min-h-screen">
      <Navbar />

      {/* Main Invoice Form Section */}
      <section className="px-4 pb-10 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <InvoiceFormLazy />
        </div>
      </section>

      {/* Ad Section */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <AdSenseUnit slot="3344556677" format="auto" style={{ minHeight: '110px' }} />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-anchor px-4 py-20 sm:px-6">
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
                className="app-card group"
              >
                <div className="feature-icon mb-6">
                  <span className="text-lg font-bold text-indigo-600">0{step}</span>
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
      </section>

      {/* Benefits Banner */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="app-card text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {t('benefitsTitle')}
            </h2>
            <p className="mt-5 max-w-3xl mx-auto text-base leading-relaxed text-slate-600">
              {t('benefitsDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Ad Section */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <AdSenseUnit slot="8899001122" format="auto" style={{ minHeight: '110px' }} />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-anchor px-4 py-20 sm:px-6">
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
            <div className="app-card">
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
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative app-card bg-slate-900 border-slate-700">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-semibold text-white rounded-full">
                Popular
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
              <Link href={`/${locale}`} className="mt-8 app-btn app-btn-primary w-full">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-anchor px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {t('faqTitle')}
          </h2>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((faq) => (
              <details
                key={faq}
                className="app-card group cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 text-lg font-semibold text-slate-900 list-none">
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
      </section>

      {/* Blog Section */}
      <section id="blog" className="section-anchor px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {t('recentArticlesTitle')}
              </h2>
            </div>
            <Link href="/blog" locale={locale} className="hidden sm:inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              {t('viewAllBlogPosts')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="app-card group cursor-pointer"
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
                  <span>Read more</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </section>

      <SiteFooter />
    </main>
  );
}
