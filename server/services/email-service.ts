import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set. Email functionality will not work.');
}

interface EmailContent {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (content: EmailContent): Promise<boolean> => {
  if (!process.env.SENDGRID_API_KEY) {
    console.error('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    const msg = {
      to: content.to,
      from: process.env.EMAIL_FROM || 'no-reply@kbhgames.com', // Set a default sender if EMAIL_FROM is not defined
      subject: content.subject,
      text: content.text,
      html: content.html,
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string, 
  resetToken: string, 
  isAdmin = false
): Promise<boolean> => {
  // Base URL for password reset
  const baseUrl = process.env.BASE_URL || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
  
  // Generate reset URL based on whether it's an admin or regular user
  const resetUrl = isAdmin
    ? `${baseUrl}/admin/reset-password?token=${resetToken}`
    : `${baseUrl}/reset-password?token=${resetToken}`;

  const subject = isAdmin
    ? 'Admin Password Reset Request'
    : 'Password Reset Request';

  const text = `
    You requested a password reset for your account. 
    Please click the link below to reset your password:
    
    ${resetUrl}
    
    This link will expire in 30 minutes.
    
    If you did not request a password reset, please ignore this email or contact support if you have concerns.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #5C6AC4;">${isAdmin ? 'Admin Password Reset' : 'Password Reset'}</h2>
      </div>
      <p>Hello,</p>
      <p>You requested a password reset for your account. Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #5C6AC4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 14px;">
        ${resetUrl}
      </p>
      <p><strong>This link will expire in 30 minutes.</strong></p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
        <p>This is an automated email, please do not reply.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    text,
    html
  });
};