import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

export type BlogMeta = {
  slug: string;
  lang: string;
  title: string;
  date: string;
  excerpt: string;
  coverImageUrl: string;
};

export function getPosts(lang: 'en' | 'et'): BlogMeta[] {
  const dir = path.join(process.cwd(), 'content/blog', lang);
  const files = fs.readdirSync(dir);

  return files
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx$/, ''),
        lang,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        coverImageUrl: data.coverImageUrl,
      } as BlogMeta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostFile(lang: 'en' | 'et', slug: string) {
  const filePath = path.join(process.cwd(), 'content/blog', lang, `${slug}.mdx`);
  return fs.readFileSync(filePath, 'utf-8');
}
