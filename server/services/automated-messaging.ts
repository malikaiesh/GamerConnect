import { db } from "@db";
import { automatedMessageTemplates, automatedMessageHistory, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface MessageTriggerData {
  userId: number;
  trigger: string;
  variables: Record<string, string>;
  metadata?: Record<string, any>;
}

export class AutomatedMessagingService {
  
  /**
   * Send automated message based on trigger
   */
  async sendAutomatedMessage(data: MessageTriggerData): Promise<void> {
    try {
      // Find active templates for this trigger
      const templates = await db.select()
        .from(automatedMessageTemplates)
        .where(
          and(
            eq(automatedMessageTemplates.trigger, data.trigger),
            eq(automatedMessageTemplates.isActive, true)
          )
        );

      if (templates.length === 0) {
        console.log(`No active templates found for trigger: ${data.trigger}`);
        return;
      }

      // Get user information
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, data.userId));

      if (!user) {
        console.error(`User not found: ${data.userId}`);
        return;
      }

      // Process each template
      for (const template of templates) {
        await this.processMessageTemplate(template, user, data);
      }

    } catch (error) {
      console.error('Error sending automated message:', error);
    }
  }

  /**
   * Process individual message template
   */
  private async processMessageTemplate(
    template: any,
    user: any,
    triggerData: MessageTriggerData
  ): Promise<void> {
    try {
      // Replace variables in content
      const processedContent = this.replaceVariables(template.content, {
        ...triggerData.variables,
        username: user.username,
        displayName: user.displayName || user.username,
        email: user.email || 'Not provided'
      });

      const processedTitle = this.replaceVariables(template.title, {
        ...triggerData.variables,
        username: user.username,
        displayName: user.displayName || user.username
      });

      // Send message based on channel
      const success = await this.sendMessage(
        template.channel,
        user,
        processedTitle,
        processedContent
      );

      // Log to history
      await this.logMessageHistory({
        templateId: template.id,
        userId: user.id,
        trigger: triggerData.trigger,
        channel: template.channel,
        content: processedContent,
        status: success ? 'sent' : 'failed',
        triggerData: triggerData.metadata || {}
      });

    } catch (error) {
      console.error('Error processing message template:', error);
      
      // Log failed attempt
      await this.logMessageHistory({
        templateId: template.id,
        userId: user.id,
        trigger: triggerData.trigger,
        channel: template.channel,
        content: template.content,
        status: 'failed',
        triggerData: { error: error.message }
      });
    }
  }

  /**
   * Replace variables in message content
   */
  private replaceVariables(content: string, variables: Record<string, string>): string {
    let processedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, value || '');
    });

    return processedContent;
  }

  /**
   * Send message via specified channel
   */
  private async sendMessage(
    channel: string,
    user: any,
    title: string,
    content: string
  ): Promise<boolean> {
    try {
      switch (channel) {
        case 'email':
          return await this.sendEmailMessage(user, title, content);
        case 'in_app':
          return await this.sendInAppMessage(user, title, content);
        case 'sms':
          return await this.sendSMSMessage(user, title, content);
        case 'push':
          return await this.sendPushMessage(user, title, content);
        default:
          console.error(`Unsupported message channel: ${channel}`);
          return false;
      }
    } catch (error) {
      console.error(`Error sending ${channel} message:`, error);
      return false;
    }
  }

  /**
   * Send email message
   */
  private async sendEmailMessage(user: any, title: string, content: string): Promise<boolean> {
    try {
      if (!user.email) {
        console.log(`User ${user.username} has no email address`);
        return false;
      }

      // For now, just log the email (implement actual email sending later)
      console.log(`📧 Email to ${user.email}: ${title}`);
      console.log(`Content: ${content}`);
      
      // TODO: Integrate with SendGrid or other email service
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send in-app message
   */
  private async sendInAppMessage(user: any, title: string, content: string): Promise<boolean> {
    try {
      // For now, just log the in-app message (implement actual in-app messaging later)
      console.log(`📱 In-app message to ${user.username}: ${title}`);
      console.log(`Content: ${content}`);
      
      // TODO: Integrate with in-app messaging system
      return true;
    } catch (error) {
      console.error('Error sending in-app message:', error);
      return false;
    }
  }

  /**
   * Send SMS message
   */
  private async sendSMSMessage(user: any, title: string, content: string): Promise<boolean> {
    try {
      // For now, just log the SMS (implement actual SMS sending later)
      console.log(`📱 SMS to ${user.username}: ${title}`);
      console.log(`Content: ${content}`);
      
      // TODO: Integrate with Twilio or other SMS service
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send push notification
   */
  private async sendPushMessage(user: any, title: string, content: string): Promise<boolean> {
    try {
      // For now, just log the push notification (implement actual push notifications later)
      console.log(`🔔 Push notification to ${user.username}: ${title}`);
      console.log(`Content: ${content}`);
      
      // TODO: Integrate with push notification system
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Log message to history
   */
  private async logMessageHistory(data: {
    templateId: number;
    userId: number;
    trigger: string;
    channel: string;
    content: string;
    status: 'sent' | 'failed';
    triggerData: Record<string, any>;
  }): Promise<void> {
    try {
      await db.insert(automatedMessageHistory).values({
        templateId: data.templateId,
        userId: data.userId,
        trigger: data.trigger,
        channel: data.channel,
        content: data.content,
        status: data.status,
        sentAt: new Date(),
        triggerData: data.triggerData
      });
    } catch (error) {
      console.error('Error logging message history:', error);
    }
  }

  /**
   * Trigger purchase confirmation message
   */
  async triggerPurchaseConfirmation(data: {
    userId: number;
    transactionId: string;
    amount: number;
    currency: string;
    item: string;
  }): Promise<void> {
    await this.sendAutomatedMessage({
      userId: data.userId,
      trigger: 'purchase_confirmation',
      variables: {
        transactionId: data.transactionId,
        amount: data.amount.toString(),
        currency: data.currency,
        item: data.item,
        date: new Date().toLocaleDateString()
      },
      metadata: {
        transactionId: data.transactionId,
        amount: data.amount,
        currency: data.currency
      }
    });
  }

  /**
   * Trigger verification processing message
   */
  async triggerVerificationProcessing(data: {
    userId: number;
    requestId: number;
    type: string;
  }): Promise<void> {
    await this.sendAutomatedMessage({
      userId: data.userId,
      trigger: 'verification_processing',
      variables: {
        requestId: data.requestId.toString(),
        type: data.type,
        submittedDate: new Date().toLocaleDateString()
      },
      metadata: {
        requestId: data.requestId,
        type: data.type
      }
    });
  }

  /**
   * Trigger verification approval message
   */
  async triggerVerificationApproval(data: {
    userId: number;
    type: string;
    badgeType?: string;
  }): Promise<void> {
    await this.sendAutomatedMessage({
      userId: data.userId,
      trigger: 'verification_approved',
      variables: {
        type: data.type,
        badgeType: data.badgeType || 'verified',
        approvedDate: new Date().toLocaleDateString()
      },
      metadata: {
        type: data.type,
        badgeType: data.badgeType
      }
    });
  }

  /**
   * Trigger verification rejection message
   */
  async triggerVerificationRejection(data: {
    userId: number;
    type: string;
    reason?: string;
  }): Promise<void> {
    await this.sendAutomatedMessage({
      userId: data.userId,
      trigger: 'verification_rejected',
      variables: {
        type: data.type,
        reason: data.reason || 'Please review and resubmit with correct information',
        rejectedDate: new Date().toLocaleDateString()
      },
      metadata: {
        type: data.type,
        reason: data.reason
      }
    });
  }
}

// Export singleton instance
export const automatedMessaging = new AutomatedMessagingService();