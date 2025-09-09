// Utility functions for verification status checking

export interface VerificationData {
  isVerified: boolean;
  verificationExpiresAt?: string | null;
}

/**
 * Checks if a user or room verification is currently valid (verified and not expired)
 */
export function isVerificationValid(data: VerificationData): boolean {
  if (!data.isVerified) {
    return false;
  }

  // If no expiration date is set, verification is permanent (valid)
  if (!data.verificationExpiresAt) {
    return true;
  }

  // Check if verification has expired
  const expirationDate = new Date(data.verificationExpiresAt);
  const now = new Date();
  
  return now < expirationDate;
}

/**
 * Gets a human-readable expiration status for verification
 */
export function getVerificationExpirationStatus(data: VerificationData): {
  isValid: boolean;
  status: 'active' | 'expired' | 'not_verified';
  expiresIn?: string;
  expiredSince?: string;
} {
  if (!data.isVerified) {
    return { isValid: false, status: 'not_verified' };
  }

  if (!data.verificationExpiresAt) {
    return { isValid: true, status: 'active' };
  }

  const expirationDate = new Date(data.verificationExpiresAt);
  const now = new Date();
  
  if (now >= expirationDate) {
    return {
      isValid: false,
      status: 'expired',
      expiredSince: formatTimeAgo(now.getTime() - expirationDate.getTime())
    };
  }

  return {
    isValid: true,
    status: 'active',
    expiresIn: formatTimeAgo(expirationDate.getTime() - now.getTime())
  };
}

/**
 * Formats milliseconds into a human-readable time duration
 */
function formatTimeAgo(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}