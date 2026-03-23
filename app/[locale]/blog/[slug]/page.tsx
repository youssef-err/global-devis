import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getPostSlugs, markdownToHtml, getAllPosts } from '@/lib/blog';
import InvoiceCTA from '@/components/blog/InvoiceCTA';
import AdSenseUnit from '@/components/ads/AdSenseUnit';
import Link from 'next/link';

type Props = { params: any };

export async function generateStaticParams(props: { params: any }) {
  const { locale } = await props.params;
  const slugs = getPostSlugs(locale);
  return slugs.map((file) => ({
    slug: file.replace(/\.md$/, ''),
  }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, slug } = await props.params;
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
      publishedTime: post.frontmatter.date,
    },
  };
}

export default async function BlogPostPage(props: Props) {
  const { locale, slug } = await props.params;
  const isAr = locale === 'ar';
  const post = getPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);

  // Generate FAQ JSON-LD if faqs exist
  const hasFaqs = post.frontmatter.faqs && post.frontmatter.faqs.length > 0;
  const faqSchema = hasFaqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.frontmatter.faqs?.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {hasFaqs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <header className="mb-12">
          <time dateTime={post.frontmatter.date} className="block text-sm text-slate-500 mb-4">
            {post.frontmatter.date}
          </time>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
            {post.frontmatter.title}
          </h1>
          <p className="text-xl text-slate-600 leading-8">
            {post.frontmatter.description}
          </p>
        </header>

        <article 
          className="prose prose-slate prose-lg max-w-none prose-h2:text-indigo-900 prose-h2:mt-12 prose-a:text-indigo-600"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="my-12 w-full">
          <AdSenseUnit slot="1122334455" format="rectangle" style={{ minHeight: '250px' }} />
        </div>

        {/* Related Articles SEO Silo */}
        {getAllPosts(locale).filter(p => p.slug !== slug).length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {getAllPosts(locale)
                .filter(p => p.slug !== slug)
                .slice(0, 3)
                .map(related => (
                  <Link href={`/${locale}/blog/${related.slug}`} key={related.slug} className="block group">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl hover:shadow-md transition">
                      <h4 className="text-lg font-semibold text-indigo-600 mb-2 group-hover:underline">{related.frontmatter.title}</h4>
                      <p className="text-slate-600 text-sm line-clamp-2">{related.frontmatter.description}</p>
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
