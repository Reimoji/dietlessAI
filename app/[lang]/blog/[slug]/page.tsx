// app/[lang]/blog/[slug]/page.tsx

import { getPostFile } from '@/lib/blog';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

type Props = {
  params: Promise<{ lang: 'en' | 'et'; slug: string }>;
};

// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params; // <-- await
  const raw = getPostFile(lang, slug);
  if (!raw) return {};

  const { data } = matter(raw);
  return {
    title: data.title,
    description: data.excerpt,
  };
}

export default async function BlogPost({ params }: Props) {
  const { lang, slug } = await params; // <-- await
  const raw = getPostFile(lang, slug);

  if (!raw) {
    console.error('❌ No raw file found', { lang, slug });
    return notFound();
  }

  const { content, data } = matter(raw);

  let compiled;
  try {
    compiled = await compileMDX({
      source: content,
      options: {
        parseFrontmatter: false,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        },
      },
    });
  } catch (err) {
    console.error('❌ compileMDX failed', err);
    return notFound();
  }

  return (
    <main>
      {/* Hero Section */}
      <section className='pt-10 pb-15 relative overflow-hidden bg-background'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10'>
          {data.coverImageUrl && (
            <Image
              src={data.coverImageUrl}
              alt={data.title}
              width={800}
              height={400}
              className='rounded-lg shadow-lg mb-10 mx-auto'
              priority
            />
          )}

          <h1 className='text-4xl font-bold text-foreground tracking-tight sm:text-5xl mb-4'>
            {data.title}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {new Date(data.date).toLocaleDateString(lang === 'et' ? 'et-EE' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {data.excerpt && (
            <p className='mt-6 text-lg text-muted-foreground max-w-2xl mx-auto'>{data.excerpt}</p>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className='bg-background w-full'>
        <div className='max-w-3xl mx-auto mb-16 px-4 prose prose-neutral lg:prose-lg'>
          {compiled.content}
        </div>
      </section>
    </main>
  );
}
