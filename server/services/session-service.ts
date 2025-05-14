import { db } from '@db';
import { userSessions, users, sessionStatusEnum } from '@shared/schema';
import { eq, and, desc, lt, gt } from 'drizzle-orm';
import { Request } from 'express';
import crypto from 'crypto';

/**
 * Utility class for managing user sessions
 */
export class SessionService {
  /**
   * Create a new user session
   */
  static async createSession(userId: number, req: Request): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30); // 30 days expiry

    // Extract device information
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.socket.remoteAddress || '';
    
    // Create a device info object
    const deviceInfo = {
      browser: this.getBrowserInfo(userAgent),
      os: this.getOSInfo(userAgent),
      device: this.getDeviceInfo(userAgent),
    };

    // Try to determine location from IP (basic implementation)
    const location = await this.getLocationInfo(ip);

    // Create session in database
    await db.insert(userSessions).values({
      userId,
      token,
      ipAddress: ip,
      userAgent,
      deviceInfo,
      expiresAt: expireDate,
      status: 'active',
      location,
      lastActivity: new Date(),
      createdAt: new Date(),
    });

    return token;
  }

  /**
   * Validate a session token
   */
  static async validateSession(token: string): Promise<boolean> {
    const session = await db.query.userSessions.findFirst({
      where: and(
        eq(userSessions.token, token),
        eq(userSessions.status, 'active'),
        gt(userSessions.expiresAt, new Date())
      ),
    });

    if (!session) {
      return false;
    }

    // Update last activity
    await db.update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.id, session.id));

    return true;
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: number) {
    return await db.query.userSessions.findMany({
      where: and(
        eq(userSessions.userId, userId),
        eq(userSessions.status, 'active'),
        gt(userSessions.expiresAt, new Date())
      ),
      orderBy: desc(userSessions.lastActivity),
    });
  }

  /**
   * Revoke a specific session
   */
  static async revokeSession(sessionId: number, userId: number) {
    return await db.update(userSessions)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(userSessions.id, sessionId),
          eq(userSessions.userId, userId)
        )
      );
  }

  /**
   * Revoke all sessions except current one
   */
  static async revokeAllOtherSessions(userId: number, currentSessionId: number) {
    return await db.update(userSessions)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.status, 'active'),
          userId ? eq(userSessions.userId, userId) : undefined,
          currentSessionId ? eq(userSessions.id, currentSessionId, true) : undefined
        )
      );
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions() {
    const now = new Date();
    return await db.update(userSessions)
      .set({ status: 'expired' })
      .where(
        and(
          eq(userSessions.status, 'active'),
          lt(userSessions.expiresAt, now)
        )
      );
  }

  /**
   * Get browser information from User-Agent
   */
  private static getBrowserInfo(userAgent: string) {
    // Basic implementation - in production you might use a proper UA parser library
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
    return 'Unknown';
  }

  /**
   * Get OS information from User-Agent
   */
  private static getOSInfo(userAgent: string) {
    // Basic implementation
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get device type from User-Agent
   */
  private static getDeviceInfo(userAgent: string) {
    // Basic implementation
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Get location information from IP
   * This is a placeholder - in a real application you'd use a geolocation service
   */
  private static async getLocationInfo(ip: string) {
    // In a real app, you'd call a geolocation API here
    // For now, return a placeholder
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown'
    };
  }
}