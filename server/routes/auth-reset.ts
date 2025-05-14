import { Router } from 'express';
import { z } from 'zod';
import { 
  createPasswordResetToken,
  validateResetToken,
  resetPassword
} from '../services/password-reset-service';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const router = Router();
const scryptAsync = promisify(scrypt);

// Hash password for secure storage
const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
};

// Schema for requesting a password reset
const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  isAdmin: z.boolean().optional().default(false)
});

// Schema for validating a password reset token
const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  isAdmin: z.boolean().optional().default(false)
});

// Schema for resetting a password
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  isAdmin: z.boolean().optional().default(false)
});

// Route to request a password reset
router.post('/request-reset', async (req, res) => {
  try {
    // Validate request body
    const { email, isAdmin } = requestResetSchema.parse(req.body);
    
    // Create password reset token and send email
    const result = await createPasswordResetToken(email, req, isAdmin);
    
    return res.json(result);
  } catch (error) {
    console.error('Error requesting password reset:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

// Route to validate a password reset token
router.post('/validate-token', async (req, res) => {
  try {
    // Validate request body
    const { token, isAdmin } = validateTokenSchema.parse(req.body);
    
    // Validate token
    const result = await validateResetToken(token, isAdmin);
    
    return res.json({ success: result.valid });
  } catch (error) {
    console.error('Error validating token:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
  try {
    // Validate request body
    const { token, password, isAdmin } = resetPasswordSchema.parse(req.body);
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Reset the password
    const result = await resetPassword(token, hashedPassword, isAdmin);
    
    return res.json(result);
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred. Please try again later.' 
    });
  }
});

export default router;