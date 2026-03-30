import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import TrackedBlogLink from '@/components/blog/TrackedBlogLink';
import AffiliateRecommendations from '@/components/blog/AffiliateRecommendations';
import BlogAnalytics from '@/components/blog/BlogAnalytics';
import { getAllPosts, getPostBySlug, getPostSlugs, markdownToHtml } from '@/lib/blog';
import { routing } from '@/i18n/routing';

export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPostSlugs(locale).map((file) => ({
      locale,
      slug: file.replace(/\.md$/, '')
    }))
  );
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return {};
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    keywords: post.frontmatter.keywords || 'invoice, generator, freelance, billing',
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      type: 'article',
      publishedTime: post.frontmatter.date
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const isAr = locale === 'ar';
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);
  const articleSections = contentHtml.split(/(?=<h2>)/g).filter(Boolean);
  const relatedPosts = getAllPosts(locale)
    .filter((candidate) => candidate.slug !== slug)
    .slice(0, 2);
  
  const invoiceToolUrl = `/${locale}`;

  const hasFaqs = Boolean(post.frontmatter.faqs?.length);
  const faqSchema = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.frontmatter.faqs?.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.date,
    author: {
      '@type': 'Organization',
      name: 'Global Devis'
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 py-16 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <BlogAnalytics />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {hasFaqs && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <header className="mb-12">
          <time dateTime={post.frontmatter.date} className="mb-4 block text-sm text-slate-500">
            {post.frontmatter.date}
          </time>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{post.frontmatter.title}</h1>
          <p className="text-xl leading-8 text-slate-600">{post.frontmatter.description}</p>
        </header>

        <div className="my-10">
          <AdSenseUnit slot="5566778899" format="auto" style={{ minHeight: '110px' }} labelText="Related reading" />
        </div>

        <article className="prose prose-lg prose-slate max-w-none prose-a:text-indigo-600 prose-h2:mt-12 prose-h2:text-indigo-900">
          {articleSections.map((section, index) => {
            const isLastSection = index === articleSections.length - 1;
            const shouldShowAd = !isLastSection && index >= 1 && (index + 1) % 2 === 0;
            const showAffiliate = index === Math.floor(articleSections.length / 2);
            
            return (
              <div key={`section-${index}`}>
                <div dangerouslySetInnerHTML={{ __html: section }} />
                {showAffiliate && (
                  <AffiliateRecommendations
                    links={[
                      { name: 'Wave Accounting', url: 'https://www.waveapp.com', description: 'Free accounting & invoicing software for small businesses', type: 'tool' },
                      { name: 'FreshBooks', url: 'https://www.freshbooks.com', description: 'Cloud accounting built for freelancers and self-employed', type: 'tool' },
                    ]}
                  />
                )}
                {shouldShowAd && (
                  <div className="my-10">
                    <AdSenseUnit slot="6677889900" format="auto" style={{ minHeight: '110px' }} labelText="Recommended tools" />
                  </div>
                )}
                {isLastSection && !hasFaqs && (
                  <div className="my-10">
                    <AdSenseUnit slot="6677889900" format="auto" style={{ minHeight: '110px' }} labelText="More resources" />
                  </div>
                )}
              </div>
            );
          })}
        </article>

        <div className="my-10">
          <AdSenseUnit slot="1122334455" format="rectangle" style={{ minHeight: '250px' }} labelText="Featured solution" />
        </div>

        <div className={`mt-12 p-6 bg-indigo-50 rounded-xl border border-indigo-100 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 mb-1">{t('invoiceCtaTitle')}</h3>
              <p className="text-sm text-indigo-700">{t('invoiceCtaDesc')}</p>
            </div>
            <TrackedBlogLink href={invoiceToolUrl} title={t('createInvoice')} className="shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                {t('createInvoice')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </TrackedBlogLink>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className={`mt-16 border-t border-slate-200 pt-10 ${isAr ? 'text-right' : 'text-left'}`}>
            <h3 className="mb-6 text-xl font-bold text-slate-800">{t('relatedArticles')}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <TrackedBlogLink href={`/${locale}/blog/${related.slug}`} title={related.frontmatter.title} key={related.slug} className="group block">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 transition hover:shadow-md hover:border-indigo-200">
                    <h4 className="mb-2 font-semibold text-slate-800 group-hover:text-indigo-600 transition">{related.frontmatter.title}</h4>
                    <p className="line-clamp-2 text-sm text-slate-600">{related.frontmatter.description}</p>
                  </div>
                </TrackedBlogLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
