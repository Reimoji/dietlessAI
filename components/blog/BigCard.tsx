import { BlogMeta } from '@/lib/blog';
import Image from 'next/image';
import Link from 'next/link';

export default function BigCard({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/${post.lang}/blog/${post.slug}`}>
      <div className='bg-card rounded-xl shadow-md overflow-hidden hover:scale-[1.01] transition-transform'>
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          width={1200}
          height={600}
          className='w-full h-64 object-cover'
        />
        <div className='p-6'>
          <p className='text-sm text-muted-foreground mb-2'>
            {new Date(post.date).toLocaleDateString('et-EE')}
          </p>
          <h2 className='text-2xl font-bold text-foreground mb-3'>{post.title}</h2>
          <p className='text-muted-foreground'>{post.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
