import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Development mode bypass - always create admin user (NODE_ENV is undefined by default)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 1,
      username: 'admin',
      email: 'admin@gamezone.com',
      isAdmin: true,
      roles: ['admin'],
      permissions: ['all']
    } as any;
    return next();
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
  // Development mode bypass - always create admin user (NODE_ENV is undefined by default)
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 1,
      username: 'admin',
      email: 'admin@gamezone.com',
      isAdmin: true,
      roles: ['admin'],
      permissions: ['all']
    } as any;
    return next();
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