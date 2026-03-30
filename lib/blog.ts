import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content', 'blog');

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  date: string;
  keywords?: string;
  faqs?: { question: string; answer: string }[];
}

export interface BlogPost {
  slug: string;
  locale: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
}

export function getPostSlugs(locale: string) {
  const dir = path.join(postsDirectory, locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir);
}

export function getPostBySlug(slug: string, locale: string): BlogPost | null {
  try {
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, locale, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: realSlug,
      locale,
      frontmatter: {
        title: (data.title as string) ?? '',
        description: (data.description as string) ?? '',
        date: (data.date as string) ?? '',
        keywords: data.keywords as string | undefined,
        faqs: data.faqs as { question: string; answer: string }[] | undefined,
      },
      content,
    };
  } catch {
    return null;
  }
}

export function getAllPosts(locale: string): BlogPost[] {
  return getPostSlugs(locale)
    .map((slug) => getPostBySlug(slug, locale))
    .filter((post): post is BlogPost => post !== null)
    .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(remarkHtml).process(markdown);
  return result.toString();
}
