import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SeoSchema } from '@shared/schema';

interface SeoSchemaConfig {
  contentType?: 'game' | 'blog_post' | 'page' | 'category' | 'pricing' | 'rooms';
  contentId?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch and inject SEO schemas into document head as JSON-LD
 * 
 * @param config Configuration for schema fetching
 * @returns Query result with schemas data
 */
export function useSeoSchemas({ contentType, contentId, enabled = true }: SeoSchemaConfig = {}) {
  // Fetch schemas from API
  const { data: schemas, isLoading, error } = useQuery<SeoSchema[]>({
    queryKey: ['/api/seo-schemas/content', contentType, contentId],
    enabled: enabled && !!contentType && !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Inject schemas into document head
  useEffect(() => {
    if (!schemas || schemas.length === 0) {
      return;
    }

    // Remove existing SEO schema scripts
    const existingSchemas = document.querySelectorAll('script[data-seo-schema]');
    existingSchemas.forEach(script => script.remove());

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      if (!schema.isActive || !schema.schemaData) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', `${schema.contentType}-${schema.contentId || 'global'}-${index}`);
      script.textContent = JSON.stringify(schema.schemaData, null, 2);
      
      document.head.appendChild(script);
      
      console.log(`✅ SEO Schema injected: ${schema.schemaType} for ${schema.contentType}${schema.contentId ? ` ID ${schema.contentId}` : ''}`);
    });

    // Cleanup function to remove schemas when component unmounts
    return () => {
      const schemasToRemove = document.querySelectorAll('script[data-seo-schema]');
      schemasToRemove.forEach(script => {
        const dataAttr = script.getAttribute('data-seo-schema');
        if (dataAttr?.includes(`${contentType}-${contentId}`)) {
          script.remove();
        }
      });
    };
  }, [schemas, contentType, contentId]);

  return {
    schemas,
    isLoading,
    error,
    hasSchemas: schemas && schemas.length > 0
  };
}

/**
 * Hook to inject global/organization schemas that should appear on all pages
 */
export function useGlobalSeoSchemas() {
  const { data: globalSchemas } = useQuery<SeoSchema[]>({
    queryKey: ['/api/seo-schemas/global'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (!globalSchemas || globalSchemas.length === 0) {
      return;
    }

    // Remove existing global schema scripts
    const existingGlobalSchemas = document.querySelectorAll('script[data-global-seo-schema]');
    existingGlobalSchemas.forEach(script => script.remove());

    // Add global schema scripts
    globalSchemas.forEach((schema, index) => {
      if (!schema.isActive || !schema.schemaData) return;

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-global-seo-schema', `global-${index}`);
      script.textContent = JSON.stringify(schema.schemaData, null, 2);
      
      document.head.appendChild(script);
      
      console.log(`✅ Global SEO Schema injected: ${schema.schemaType}`);
    });

    // Cleanup function
    return () => {
      const schemasToRemove = document.querySelectorAll('script[data-global-seo-schema]');
      schemasToRemove.forEach(script => script.remove());
    };
  }, [globalSchemas]);

  return {
    globalSchemas,
    hasGlobalSchemas: globalSchemas && globalSchemas.length > 0
  };
}