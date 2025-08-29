import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Check for admin privileges using both camelCase and snake_case field names
  const isAdmin = req.user?.isAdmin || (req.user as any)?.is_admin;
  if (!req.user || !isAdmin) {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  
  next();
}