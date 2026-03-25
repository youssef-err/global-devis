import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import InvoiceCTA from '@/components/blog/InvoiceCTA';
import { getAllPosts, getPostBySlug, getPostSlugs, markdownToHtml } from '@/lib/blog';
import { routing } from '@/i18n/routing';

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
  const isAr = locale === 'ar';
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);
  const relatedPosts = getAllPosts(locale)
    .filter((candidate) => candidate.slug !== slug)
    .slice(0, 3);

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

        <article
          className="prose prose-lg prose-slate max-w-none prose-a:text-indigo-600 prose-h2:mt-12 prose-h2:text-indigo-900"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="my-12 w-full">
          <AdSenseUnit slot="1122334455" format="rectangle" style={{ minHeight: '250px' }} />
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16 border-t border-slate-200 pt-10">
            <h3 className="mb-6 text-2xl font-bold text-slate-800">Related Articles</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link href={`/${locale}/blog/${related.slug}`} key={related.slug} className="group block">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 transition hover:shadow-md">
                    <h4 className="mb-2 text-lg font-semibold text-indigo-600 group-hover:underline">{related.frontmatter.title}</h4>
                    <p className="line-clamp-2 text-sm text-slate-600">{related.frontmatter.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <InvoiceCTA locale={locale} />
        </div>
      </div>
    </div>
  );
}
