import { BlogMeta } from '@/lib/blog';
import Image from 'next/image';
import Link from 'next/link';

export default function SmallCard({ post }: { post: BlogMeta }) {
  return (
    <Link href={`/${post.lang}/blog/${post.slug}`}>
      <div className='bg-card rounded-lg shadow-md overflow-hidden hover:scale-[1.02] transition-transform'>
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          width={600}
          height={300}
          className='w-full h-40 object-cover'
        />
        <div className='p-4'>
          <p className='text-xs text-muted-foreground mb-1'>
            {new Date(post.date).toLocaleDateString('et-EE')}
          </p>
          <h3 className='text-lg font-semibold text-foreground mb-2'>{post.title}</h3>
          <p className='text-sm text-muted-foreground'>{post.excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
