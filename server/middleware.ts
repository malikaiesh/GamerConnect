import { Request, Response, NextFunction } from "express";

// Authentication middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Admin role middleware - must be used after isAuthenticated
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Not authorized" });
}