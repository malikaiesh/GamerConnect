import { Link } from 'wouter';
import { BlogPost } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
  size?: 'sm' | 'md' | 'lg';
}

export function BlogCard({ post, size = 'md' }: BlogCardProps) {
  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const sizeClasses = {
    sm: {
      card: 'bg-card rounded-lg shadow-md overflow-hidden',
      image: 'w-full h-32 object-cover',
      title: 'text-md font-bold font-poppins text-foreground line-clamp-2',
      excerpt: 'text-xs text-muted-foreground line-clamp-2',
      padding: 'p-3'
    },
    md: {
      card: 'bg-card rounded-xl shadow-lg overflow-hidden',
      image: 'w-full h-48 object-cover',
      title: 'text-xl font-bold font-poppins text-foreground mb-3',
      excerpt: 'text-sm text-muted-foreground line-clamp-3',
      padding: 'p-5'
    },
    lg: {
      card: 'bg-card rounded-xl shadow-lg overflow-hidden',
      image: 'w-full h-56 object-cover',
      title: 'text-2xl font-bold font-poppins text-foreground mb-3',
      excerpt: 'text-foreground line-clamp-3',
      padding: 'p-6'
    }
  };
  
  const postUrl = `/blog/${post.slug}`;
  
  return (
    <article className={sizeClasses[size].card}>
      <div className="relative">
        <Link href={postUrl}>
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className={sizeClasses[size].image}
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent w-full h-24">
            <div className="absolute bottom-3 left-3">
              {post.categoryId && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                  {post.category?.name || ''}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
      
      <div className={sizeClasses[size].padding}>
        <Link href={postUrl}>
          <h3 className={sizeClasses[size].title}>{post.title}</h3>
        </Link>
        
        <p className={sizeClasses[size].excerpt}>{post.excerpt}</p>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden mr-2">
              <img 
                src={post.authorAvatar || 'https://ui-avatars.com/api/?name=' + post.author} 
                alt={`${post.author}'s avatar`} 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(post.publishedAt || post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
