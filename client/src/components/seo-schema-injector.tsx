import { useSeoSchemas, useGlobalSeoSchemas } from '@/hooks/useSeoSchemas';

interface SeoSchemaInjectorProps {
  contentType?: 'game' | 'blog_post' | 'page' | 'category';
  contentId?: number;
  enabled?: boolean;
}

/**
 * Component that automatically injects SEO schemas into the document head
 * 
 * Usage:
 * - Place in individual pages with specific content
 * - Or use globally in App.tsx for site-wide schemas
 * 
 * @param props Configuration for schema injection
 */
export function SeoSchemaInjector({ 
  contentType, 
  contentId, 
  enabled = true 
}: SeoSchemaInjectorProps) {
  // Inject content-specific schemas
  const { isLoading, error, hasSchemas } = useSeoSchemas({
    contentType,
    contentId,
    enabled: enabled && !!contentType && !!contentId
  });

  // Inject global schemas (organization, website, etc.)
  const { hasGlobalSchemas } = useGlobalSeoSchemas();

  // This component doesn't render anything visual
  // It just handles schema injection via the hooks
  return null;
}

/**
 * Global schema injector for site-wide schemas
 * Should be placed in App.tsx or layout component
 */
export function GlobalSeoSchemaInjector() {
  useGlobalSeoSchemas();
  return null;
}