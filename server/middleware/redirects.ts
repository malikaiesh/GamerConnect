import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { URL } from 'url';

/**
 * Middleware to handle URL redirects
 * This should be applied early in the middleware chain to catch requests
 * before they go to other routes
 */
export async function handleUrlRedirects(req: Request, res: Response, next: NextFunction) {
  // Skip handling for API requests and static files
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/_vite/') || 
      req.path === '/favicon.ico') {
    return next();
  }

  try {
    // Check if there's a redirect for this path
    const sourceUrl = req.path;
    const redirect = await storage.getRedirectForSourceUrl(sourceUrl);

    if (redirect && redirect.isActive) {
      // Handle the redirect with appropriate status code
      return res.redirect(redirect.statusCode, redirect.targetUrl);
    }

    // No redirect found, continue to next middleware
    next();
  } catch (error) {
    console.error('Error in URL redirect middleware:', error);
    // Don't interrupt the request flow on error, continue to next middleware
    next();
  }
}

/**
 * Utility function to normalize URLs for comparison
 * This helps with paths that might have trailing slashes or different formats
 */
function normalizeUrl(urlString: string): string {
  try {
    // Try to create a URL object (will throw for relative paths)
    const url = new URL(urlString);
    let path = url.pathname;
    
    // Remove trailing slash except for root path
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    return path.toLowerCase();
  } catch (error) {
    // For relative paths
    let path = urlString;
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path.toLowerCase();
  }
}