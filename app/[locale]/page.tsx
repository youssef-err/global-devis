import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import InvoiceFormLazy from '@/components/InvoiceFormLazy';
import Navbar from '@/components/Navbar';
import { Link } from '@/i18n/routing';

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
    <main className="min-h-screen bg-slate-50/50 pb-16">
      <Navbar />

      <section className="px-4 pb-8 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <InvoiceFormLazy />
        </div>
      </section>

      <section id="how-it-works" className="section-anchor px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              {t('howItWorksTitle')}
            </h2>
            <p className="mt-3 text-slate-600">{t('howItWorksIntro')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-700">
                  0{step}
                </div>
                <h3 className="text-xl font-semibold text-slate-950">
                  {t(`step${step}Title` as const)}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {t(`step${step}Desc` as const)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[32px] border border-white/70 bg-white px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              {t('benefitsTitle')}
            </h2>
            <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
              {t('benefitsDesc')}
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="section-anchor px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              {t('pricingTitle')}
            </h2>
            <p className="mt-3 text-slate-600">{t('pricingIntro')}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[30px] border border-white/70 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('pricingStarterTitle')}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                {t('pricingStarterPrice')}
              </p>
              <p className="mt-4 text-slate-600">{t('pricingStarterDesc')}</p>
            </div>
            <div className="rounded-[30px] bg-[linear-gradient(145deg,_#0f172a,_#1e1b4b_50%,_#4f46e5)] p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
                {t('pricingProTitle')}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight">
                {t('pricingProPrice')}
              </p>
              <p className="mt-4 text-slate-200">{t('pricingProDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section-anchor px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight text-slate-950">
            {t('faqTitle')}
          </h2>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((faq) => (
              <details
                key={faq}
                className="group rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-slate-950 marker:hidden">
                  <span>{t(`faq${faq}Q` as const)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 transition-colors group-open:bg-indigo-50 group-open:text-indigo-700">
                    +
                  </span>
                </summary>
                <p className="mt-4 leading-7 text-slate-600">
                  {t(`faq${faq}A` as const)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="section-anchor px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              {t('recentArticlesTitle')}
            </h2>
            <Link href="/blog" locale={locale} className="font-semibold text-indigo-600 hover:text-indigo-700">
              {t('viewAllBlogPosts')}
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { slug: 'how-to-make-invoice', title: t('article1Title'), excerpt: t('article1Excerpt') },
              { slug: 'best-invoicing-practices', title: t('article2Title'), excerpt: t('article2Excerpt') },
              { slug: 'managing-cash-flow', title: t('article3Title'), excerpt: t('article3Excerpt') }
            ].map((article) => (
              <article
                key={article.slug}
                className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <h3 className="text-xl font-semibold text-slate-950">
                  <Link href={`/blog/${article.slug}`} locale={locale} className="hover:text-indigo-600">
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{article.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
