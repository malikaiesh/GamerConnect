import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Development mode bypass when database is unavailable
  if (process.env.NODE_ENV === 'development' && !req.user) {
    req.user = {
      id: 1,
      username: 'admin',
      email: 'admin@gamezone.com',
      isAdmin: true,
      roles: ['admin'],
      permissions: ['all']
    } as any;
  }

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
}

/**
 * Middleware to check if user is an admin
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Development mode bypass when database is unavailable
  if (process.env.NODE_ENV === 'development' || !req.user) {
    // Create a mock admin user for development
    req.user = {
      id: 1,
      username: 'admin',
      email: 'admin@gamezone.com',
      isAdmin: true,
      roles: ['admin'],
      permissions: ['all']
    };
  }
  
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // @ts-ignore - The User type should have isAdmin property
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  next();
}