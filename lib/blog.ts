import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

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
      frontmatter: data as BlogPostFrontmatter,
      content,
    };
  } catch (error) {
    return null;
  }
}

export function getAllPosts(locale: string): BlogPost[] {
  const slugs = getPostSlugs(locale);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .filter((post): post is BlogPost => post !== null)
    .sort((post1, post2) => (post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
  return posts;
}

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
