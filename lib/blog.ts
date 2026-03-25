import fs from 'fs';
import path from 'path';

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

function parseScalar(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function parseFaqItems(source: string): { question: string; answer: string }[] {
  const matches = source.matchAll(/-\s+question:\s*(.+)\r?\n\s+answer:\s*(.+)/g);
  return Array.from(matches, ([, question, answer]) => ({
    question: parseScalar(question),
    answer: parseScalar(answer)
  }));
}

function parseFrontmatter(raw: string): { data: BlogPostFrontmatter; content: string } {
  if (!raw.startsWith('---')) {
    return {
      data: { title: '', description: '', date: '' },
      content: raw
    };
  }

  const end = raw.indexOf('\n---', 3);
  if (end === -1) {
    return {
      data: { title: '', description: '', date: '' },
      content: raw
    };
  }

  const frontmatterBlock = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trim();
  const data: Partial<BlogPostFrontmatter> = {};

  const faqMatch = frontmatterBlock.match(/faqs:\s*\r?\n((?:\s*-\s+question:.*\r?\n\s+answer:.*\r?\n?)*)/);
  if (faqMatch?.[1]) {
    data.faqs = parseFaqItems(faqMatch[1]);
  }

  for (const line of frontmatterBlock.split(/\r?\n/)) {
    if (!line.includes(':') || /^\s*-/.test(line) || /^\s+answer:/.test(line)) {
      continue;
    }

    const [rawKey, ...rawValue] = line.split(':');
    const key = rawKey.trim() as keyof BlogPostFrontmatter;
    const value = rawValue.join(':').trim();
    if (!value || key === 'faqs') {
      continue;
    }

    (data as Record<string, unknown>)[key] = parseScalar(value);
  }

  return {
    data: {
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      keywords: data.keywords,
      faqs: data.faqs
    },
    content
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function markdownInlineToHtml(line: string): string {
  return escapeHtml(line)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
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
    const { data, content } = parseFrontmatter(fileContents);

    return {
      slug: realSlug,
      locale,
      frontmatter: data,
      content
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

export async function markdownToHtml(markdown: string) {
  const blocks = markdown
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const html = blocks
    .map((block) => {
      if (block.startsWith('### ')) {
        return `<h3>${markdownInlineToHtml(block.slice(4))}</h3>`;
      }

      if (block.startsWith('## ')) {
        return `<h2>${markdownInlineToHtml(block.slice(3))}</h2>`;
      }

      if (block.startsWith('# ')) {
        return `<h1>${markdownInlineToHtml(block.slice(2))}</h1>`;
      }

      if (block.startsWith('- ')) {
        const items = block
          .split(/\r?\n/)
          .map((line) => line.replace(/^- /, '').trim())
          .filter(Boolean)
          .map((item) => `<li>${markdownInlineToHtml(item)}</li>`)
          .join('');

        return `<ul>${items}</ul>`;
      }

      return `<p>${markdownInlineToHtml(block.replace(/\r?\n/g, '<br />'))}</p>`;
    })
    .join('\n');

  return html;
}
