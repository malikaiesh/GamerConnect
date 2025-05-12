import { Builder } from 'xml2js';

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

export type SitemapData = {
  urls: SitemapUrl[];
};

export interface SitemapItem {
  id: number;
  slug: string;
  updatedAt?: Date;
}

const builder = new Builder({
  xmldec: { version: '1.0', encoding: 'UTF-8' },
});

/**
 * Generates a sitemap XML string from the provided URLs
 */
export function generateSitemapXml(data: SitemapData): string {
  const sitemapObj = {
    urlset: {
      $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      },
      url: data.urls.map(url => {
        const urlObj: any = { loc: url.loc };
        
        if (url.lastmod) {
          urlObj.lastmod = url.lastmod;
        }
        
        if (url.changefreq) {
          urlObj.changefreq = url.changefreq;
        }
        
        if (url.priority !== undefined) {
          urlObj.priority = url.priority.toString();
        }
        
        return urlObj;
      }),
    },
  };
  
  return builder.buildObject(sitemapObj);
}

/**
 * Generates a sitemap index XML string from the provided sitemaps
 */
export function generateSitemapIndexXml(baseUrl: string, sitemaps: string[]): string {
  const sitemapObj = {
    sitemapindex: {
      $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      },
      sitemap: sitemaps.map(sitemap => ({
        loc: `${baseUrl}${sitemap}`,
        lastmod: new Date().toISOString().split('T')[0],
      })),
    },
  };
  
  return builder.buildObject(sitemapObj);
}

/**
 * Helper function to format date for sitemap lastmod
 */
export function formatDate(date?: Date): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to generate sitemap URLs from items
 */
export function generateUrlsFromItems<T extends SitemapItem>(
  baseUrl: string, 
  items: T[],
  getPath: (item: T) => string,
  changefreq: SitemapUrl['changefreq'] = 'weekly',
  priority: number = 0.7
): SitemapUrl[] {
  return items.map(item => ({
    loc: `${baseUrl}${getPath(item)}`,
    lastmod: item.updatedAt ? formatDate(item.updatedAt) : formatDate(),
    changefreq,
    priority,
  }));
}