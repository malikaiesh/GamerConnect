import { parseString, Builder } from 'xml2js';
import { db } from "@db";
import { games, blogPosts, staticPages } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Types
export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

export interface SitemapData {
  urlset: {
    $: { xmlns: string };
    url: Array<{
      loc: string[];
      lastmod?: string[];
      changefreq?: string[];
      priority?: string[];
    }>;
  };
}

export interface SitemapIndexData {
  sitemapindex: {
    $: { xmlns: string };
    sitemap: Array<{
      loc: string[];
      lastmod?: string[];
    }>;
  };
}

// Convert SitemapURL array to XML
export function generateUrlsetXml(urls: SitemapURL[]): string {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });
  
  const urlObjects = urls.map(url => {
    const urlObj: any = {
      loc: [url.loc]
    };
    
    if (url.lastmod) {
      urlObj.lastmod = [url.lastmod];
    }
    
    if (url.changefreq) {
      urlObj.changefreq = [url.changefreq];
    }
    
    if (url.priority !== undefined) {
      urlObj.priority = [url.priority.toFixed(1)];
    }
    
    return urlObj;
  });
  
  const sitemapObj = {
    urlset: {
      $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      },
      url: urlObjects
    }
  };
  
  return builder.buildObject(sitemapObj);
}

// Convert sitemap array to sitemap index XML
export function generateSitemapIndexXml(sitemaps: { loc: string; lastmod?: string }[]): string {
  const builder = new Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });
  
  const sitemapObjects = sitemaps.map(sitemap => {
    const sitemapObj: any = {
      loc: [sitemap.loc]
    };
    
    if (sitemap.lastmod) {
      sitemapObj.lastmod = [sitemap.lastmod];
    }
    
    return sitemapObj;
  });
  
  const sitemapIndexObj = {
    sitemapindex: {
      $: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      },
      sitemap: sitemapObjects
    }
  };
  
  return builder.buildObject(sitemapIndexObj);
}

// Get all game URLs for sitemap
export async function getGameUrls(baseUrl: string): Promise<SitemapURL[]> {
  const activeGames = await db.select({
    id: games.id,
    slug: games.slug,
    updatedAt: games.updatedAt
  }).from(games).where(eq(games.status, 'active'));
  
  return activeGames.map(game => ({
    loc: `${baseUrl}/game/${game.slug}`,
    lastmod: game.updatedAt ? new Date(game.updatedAt).toISOString() : new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8
  }));
}

// Get all blog post URLs for sitemap
export async function getBlogUrls(baseUrl: string): Promise<SitemapURL[]> {
  const publishedPosts = await db.select({
    id: blogPosts.id,
    slug: blogPosts.slug,
    updatedAt: blogPosts.updatedAt
  }).from(blogPosts).where(eq(blogPosts.status, 'published'));
  
  return publishedPosts.map(post => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.7
  }));
}

// Get all static page URLs for sitemap
export async function getPageUrls(baseUrl: string): Promise<SitemapURL[]> {
  const activePages = await db.select({
    id: staticPages.id,
    slug: staticPages.slug,
    updatedAt: staticPages.updatedAt
  }).from(staticPages).where(eq(staticPages.status, 'active'));
  
  return activePages.map(page => ({
    loc: `${baseUrl}/${page.slug}`,
    lastmod: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
    changefreq: 'monthly',
    priority: 0.6
  }));
}

// Parse XML to object
export function parseXml(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}