import { db } from '@db';
import { passwordResetTokens, users, tokenTypeEnum } from '@shared/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { sendPasswordResetEmail } from './email-service';
import { Request } from 'express';

// Token expiration time (30 minutes in milliseconds)
const TOKEN_EXPIRATION = 30 * 60 * 1000;

/**
 * Generate a secure random token
 */
const generateToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Hash a token for secure storage
 */
const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Create a password reset token for a user
 */
export const createPasswordResetToken = async (
  email: string,
  req: Request,
  isAdmin = false
): Promise<{ success: boolean; message: string }> => {
  try {
    // Find the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      // Return success even if user doesn't exist for security reasons
      // This prevents email enumeration attacks
      return { success: true, message: 'If your email is in our system, you will receive reset instructions.' };
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return { success: false, message: 'Your account is blocked. Please contact support.' };
    }

    // Clear any existing unused tokens for this user
    await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt)
        )
      );

    // Generate a new token
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION);

    // Get device info from request
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'] || '';

    // Store the token in the database
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      tokenHash,
      type: isAdmin ? 'admin_reset' : 'password_reset',
      ipAddress,
      userAgent,
      isAdmin,
      expiresAt
    });

    // Send the password reset email
    const emailSent = await sendPasswordResetEmail(email, token, isAdmin);

    if (!emailSent) {
      return { success: false, message: 'Failed to send password reset email. Please try again later.' };
    }

    return { success: true, message: 'Password reset instructions have been sent to your email.' };
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return { success: false, message: 'An error occurred. Please try again later.' };
  }
};

/**
 * Validate a password reset token
 */
export const validateResetToken = async (
  token: string,
  isAdmin = false
): Promise<{ valid: boolean; userId?: number }> => {
  try {
    // Find the token in the database
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          eq(passwordResetTokens.isAdmin, isAdmin),
          lt(passwordResetTokens.expiresAt, new Date())
        )
      );

    if (!resetToken) {
      return { valid: false };
    }

    return { valid: true, userId: resetToken.userId };
  } catch (error) {
    console.error('Error validating reset token:', error);
    return { valid: false };
  }
};

/**
 * Reset a user's password using a valid token
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
  isAdmin = false
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate the token
    const { valid, userId } = await validateResetToken(token, isAdmin);

    if (!valid || !userId) {
      return { success: false, message: 'Invalid or expired token. Please request a new password reset.' };
    }

    // Find the token in the database
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    if (!resetToken) {
      return { success: false, message: 'Invalid token. Please request a new password reset.' };
    }

    // Mark the token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Update the user's password
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));

    return { success: true, message: 'Your password has been reset successfully.' };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'An error occurred. Please try again later.' };
  }
};