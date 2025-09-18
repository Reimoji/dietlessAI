import BigCard from '@/components/blog/BigCard';
import SmallCard from '@/components/blog/SmallCard';
import Footer from '@/components/layout/Footer';
import { getPosts } from '@/lib/blog';

type Props = {
  params: Promise<{ lang: 'en' | 'et' }>; // ✅ Now a Promise
};

export default async function BlogIndex({ params }: Props) {
  const { lang } = await params; // ✅ await params

  const posts = getPosts(lang);

  if (posts.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center'>
        <h1 className='text-3xl font-bold text-foreground mb-4'>Blog</h1>
        <p className='text-muted-foreground'>No posts yet. Check back soon!</p>
      </div>
    );
  }

  const [first, ...rest] = posts;

  return (
    <>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
        <h1 className='text-4xl font-bold text-center mb-16 text-foreground'>Blog</h1>

        <BigCard post={first} />

        {rest.length > 0 && (
          <div className='grid md:grid-cols-3 gap-8 mt-12'>
            {rest.map((post) => (
              <SmallCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}