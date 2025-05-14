import { Express, Request, Response } from 'express';
import { db } from '@db';
import { userSessions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware';
import { SessionService } from '../services/session-service';

export function registerSecurityRoutes(app: Express) {
  /**
   * Get current user's active sessions
   */
  app.get('/api/security/sessions', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const sessions = await SessionService.getUserSessions(req.user.id);
      
      // Map to a safer response object (don't expose the token)
      const safeSessionsData = sessions.map(session => ({
        id: session.id,
        device: session.deviceInfo?.device || 'Unknown',
        browser: session.deviceInfo?.browser || 'Unknown',
        os: session.deviceInfo?.os || 'Unknown',
        location: session.location || { country: 'Unknown', city: 'Unknown' },
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        current: session.token === req.session?.id // Determine if this is the current session
      }));

      res.json(safeSessionsData);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      res.status(500).json({ message: 'An error occurred while fetching sessions' });
    }
  });

  /**
   * Revoke a specific session
   */
  app.post('/api/security/sessions/:id/revoke', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const sessionId = parseInt(req.params.id);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: 'Invalid session ID' });
      }

      // Check if the session belongs to the current user
      const session = await db.query.userSessions.findFirst({
        where: and(
          eq(userSessions.id, sessionId),
          eq(userSessions.userId, req.user.id)
        )
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Check if trying to revoke current session
      if (session.token === req.session?.id) {
        return res.status(400).json({ message: 'Cannot revoke current session. Use logout instead.' });
      }

      await SessionService.revokeSession(sessionId, req.user.id);
      
      res.json({ message: 'Session revoked successfully' });
    } catch (error) {
      console.error('Error revoking session:', error);
      res.status(500).json({ message: 'An error occurred while revoking session' });
    }
  });

  /**
   * Revoke all other sessions except current one
   */
  app.post('/api/security/sessions/revoke-all', isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get current session ID
      const currentSession = await db.query.userSessions.findFirst({
        where: and(
          eq(userSessions.token, req.session?.id || ''),
          eq(userSessions.userId, req.user.id)
        )
      });

      if (!currentSession) {
        return res.status(404).json({ message: 'Current session not found' });
      }

      await SessionService.revokeAllOtherSessions(req.user.id, currentSession.id);
      
      res.json({ message: 'All other sessions revoked successfully' });
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      res.status(500).json({ message: 'An error occurred while revoking sessions' });
    }
  });

  /**
   * Admin endpoint to view all active sessions
   */
  app.get('/api/admin/security/sessions', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const sessions = await db.query.userSessions.findMany({
        where: eq(userSessions.status, 'active'),
        orderBy: userSessions.lastActivity,
        with: {
          user: true
        }
      });

      // Map to a safer response object (don't expose tokens)
      const safeSessionsData = sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        username: session.user?.username || 'Unknown',
        userRole: session.user?.isAdmin ? 'admin' : 'user',
        device: session.deviceInfo?.device || 'Unknown',
        browser: session.deviceInfo?.browser || 'Unknown',
        os: session.deviceInfo?.os || 'Unknown',
        ipAddress: session.ipAddress || 'Unknown',
        location: session.location || { country: 'Unknown', city: 'Unknown' },
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }));

      res.json(safeSessionsData);
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      res.status(500).json({ message: 'An error occurred while fetching sessions' });
    }
  });

  /**
   * Admin endpoint to revoke any session
   */
  app.post('/api/admin/security/sessions/:id/revoke', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: 'Invalid session ID' });
      }

      // Get the session
      const session = await db.query.userSessions.findFirst({
        where: eq(userSessions.id, sessionId)
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Revoke the session
      await db.update(userSessions)
        .set({ status: 'revoked' })
        .where(eq(userSessions.id, sessionId));
      
      res.json({ message: 'Session revoked successfully' });
    } catch (error) {
      console.error('Error revoking session:', error);
      res.status(500).json({ message: 'An error occurred while revoking session' });
    }
  });

  /**
   * Get security audit logs (mock for now, can be expanded later)
   */
  app.get('/api/security/logs', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // This would be expanded to use real security logs in a production system
    const mockLogs = [
      {
        id: 1,
        userId: 3,
        username: 'admin',
        action: 'Login',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 3600000),
        details: { success: true, method: 'password' }
      },
      {
        id: 2,
        userId: 3,
        username: 'admin',
        action: 'Password Change',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 7200000),
        details: { success: true }
      },
      {
        id: 3,
        userId: 2,
        username: 'user1',
        action: 'Login',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 10800000),
        details: { success: false, reason: 'Invalid password', attempts: 3 }
      }
    ];

    // Return mock data for now
    res.json(mockLogs);
  });

  /**
   * Get security settings (mock for now, can be expanded later)
   */
  app.get('/api/security/settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    // This would be expanded to use real settings in a production system
    const mockSettings = {
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        passwordExpiryDays: 90,
        preventReuseCount: 5
      },
      sessionPolicy: {
        maxSessionDuration: 30, // days
        inactivityTimeout: 30, // minutes
        maxConcurrentSessions: 5
      },
      twoFactorAuth: {
        enabled: false,
        required: false,
        methods: ['app', 'email']
      },
      ipRestrictions: {
        enabled: false,
        allowedIPs: []
      }
    };

    res.json(mockSettings);
  });
}