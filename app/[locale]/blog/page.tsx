import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

interface BlogIndexPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogIndexPage({ params }: BlogIndexPageProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const posts = getAllPosts(locale);

  return (
    <div className={`min-h-screen bg-slate-50 py-16 ${isAr ? 'text-right' : 'text-left'}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{isAr ? 'المدونة' : 'The Invoice Blog'}</h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            {isAr
              ? 'نصائح ومقالات حول إعداد الفواتير وتنمية عملك المستقل.'
              : 'Tips and guides to help you invoice better and grow your freelance business.'}
          </p>
          <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-20">
            {posts.map((post) => (
              <article key={post.slug} className="relative isolate flex flex-col gap-8 lg:flex-row">
                <div className="group relative max-w-xl">
                  <h3 className="mt-3 text-2xl font-semibold leading-6 text-slate-900 group-hover:text-indigo-600">
                    <Link href={`/${locale}/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.frontmatter.title}
                    </Link>
                  </h3>
                  <div className="mt-3 flex items-center gap-x-4 text-xs">
                    <time dateTime={post.frontmatter.date} className="text-slate-500">
                      {post.frontmatter.date}
                    </time>
                  </div>
                  <p className="mt-5 text-base leading-6 text-slate-600">{post.frontmatter.description}</p>
                </div>
              </article>
            ))}
            {posts.length === 0 && <p className="text-slate-500">{isAr ? 'لا توجد مقالات بعد.' : 'No posts published yet.'}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
