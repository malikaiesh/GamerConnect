import { BlogCard } from '@/components/blog/blog-card';
import { BlogPost } from '@shared/schema';

interface BlogListProps {
  posts: BlogPost[];
  loading?: boolean;
  columns?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  hasMorePosts?: boolean;
  cardSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BlogList({
  posts,
  loading = false,
  columns = 3,
  showLoadMore = false,
  onLoadMore,
  hasMorePosts = false,
  cardSize = 'md',
  className = ''
}: BlogListProps) {
  
  const gridClass = columns === 1 
    ? 'space-y-8'
    : `grid gap-6 grid-cols-1 ${
        columns === 2 
          ? 'md:grid-cols-2' 
          : columns === 3 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`;
  
  if (loading) {
    return (
      <div className={gridClass + ' ' + className}>
        {Array(columns).fill(0).map((_, index) => (
          <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-muted"></div>
            <div className="p-5">
              <div className="h-6 w-3/4 bg-muted rounded mb-3"></div>
              <div className="h-4 w-full bg-muted rounded mb-2"></div>
              <div className="h-4 w-5/6 bg-muted rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted mr-2"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mb-2">No Blog Posts Found</h3>
        <p className="text-muted-foreground">Check back later for new content.</p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className={gridClass}>
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} size={cardSize} />
        ))}
      </div>
      
      {showLoadMore && hasMorePosts && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={onLoadMore}
            className="bg-card border border-border text-foreground px-6 py-2 rounded-lg hover:bg-muted transition-colors shadow-md flex items-center"
          >
            Load More Posts <i className="ri-arrow-down-line ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
}
