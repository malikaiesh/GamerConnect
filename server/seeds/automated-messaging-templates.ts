import { db } from "@db";
import { automatedMessageTemplates } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export async function seedAutomatedMessageTemplates() {
  console.log("🌱 Seeding automated message templates...");

  const templates = [
    // Purchase Confirmation Templates
    {
      trigger: 'purchase_confirmation',
      channel: 'email',
      title: '🎉 Purchase Confirmed - {{transactionId}}',
      content: `Hi {{username}}! 👋

🎉 Fantastic news! Your purchase has been successfully completed.

📋 Purchase Details:
• Transaction ID: {{transactionId}}
• Amount: {{amount}} {{currency}}
• Item: {{item}}
• Date: {{date}}

Thank you for choosing our platform! Your support means the world to us. 💙

If you have any questions or need assistance, our support team is always here to help.

Best regards,
The Gaming Portal Team`,
      isActive: true,
      variables: JSON.stringify(['username', 'transactionId', 'amount', 'currency', 'item', 'date']),
      createdBy: 1 // Admin user
    },
    {
      trigger: 'purchase_confirmation',
      channel: 'in_app',
      title: '🎉 Purchase Successful!',
      content: `Hey {{displayName}}! Your purchase of {{item}} for {{amount}} {{currency}} has been completed successfully. Transaction ID: {{transactionId}}. Thank you for your business! 💙`,
      isActive: true,
      variables: JSON.stringify(['displayName', 'item', 'amount', 'currency', 'transactionId']),
      createdBy: 1
    },

    // Verification Processing Templates
    {
      trigger: 'verification_processing',
      channel: 'email',
      title: '⏳ Verification Request Received - Under Review',
      content: `Hi {{username}}! 👋

✅ We've received your verification request and it's now under review!

📋 Request Details:
• Request ID: #{{requestId}}
• Type: {{type}} verification
• Submitted: {{submittedDate}}

⏱️ What happens next?
Our verification team will carefully review your submission within 1-3 business days. We'll notify you immediately once the review is complete.

📧 You'll receive an email notification with the results along with any next steps or additional requirements.

Thank you for your patience as we ensure the quality and security of our verification process.

Best regards,
The Gaming Portal Verification Team`,
      isActive: true,
      variables: JSON.stringify(['username', 'requestId', 'type', 'submittedDate']),
      createdBy: 1
    },
    {
      trigger: 'verification_processing',
      channel: 'in_app',
      title: '⏳ Verification Under Review',
      content: `Hi {{displayName}}! Your {{type}} verification request (#{{requestId}}) is now being reviewed by our team. You'll be notified once the review is complete! ⏱️`,
      isActive: true,
      variables: JSON.stringify(['displayName', 'type', 'requestId']),
      createdBy: 1
    },

    // Verification Approval Templates
    {
      trigger: 'verification_approved',
      channel: 'email',
      title: '🎉 Verification Approved - Welcome to the Verified Community!',
      content: `Congratulations {{username}}! 🎉

✅ Your {{type}} verification has been APPROVED!

🔵 You've been awarded the prestigious Blue Verification Badge! This badge shows that you're a trusted and verified member of our community.

🌟 Your new verification benefits include:
• Increased credibility and trust
• Priority support access
• Exclusive verified-only features
• Enhanced profile visibility
• Special community recognition

Your verification was completed on {{approvedDate}} and is now active on your profile.

Welcome to our verified community! We're excited to have you as a verified member.

Best regards,
The Gaming Portal Team`,
      isActive: true,
      variables: JSON.stringify(['username', 'type', 'approvedDate']),
      createdBy: 1
    },
    {
      trigger: 'verification_approved',
      channel: 'in_app',
      title: '🎉 Verification Approved!',
      content: `Congratulations {{displayName}}! 🔵 Your {{type}} verification has been approved and you've earned the Blue Verification Badge! Welcome to our verified community! 🌟`,
      isActive: true,
      variables: JSON.stringify(['displayName', 'type']),
      createdBy: 1
    },
    {
      trigger: 'verification_approved',
      channel: 'push_notification',
      title: '🔵 Verification Badge Earned!',
      content: `{{displayName}}, congratulations! Your verification has been approved and you've received the Blue Verification Badge! 🎉`,
      isActive: true,
      variables: JSON.stringify(['displayName']),
      createdBy: 1
    },

    // Verification Rejection Templates
    {
      trigger: 'verification_rejected',
      channel: 'email',
      title: '❌ Verification Request Update Required',
      content: `Hi {{username}},

We've reviewed your {{type}} verification request, and we need some additional information or corrections before we can approve it.

📋 Review Details:
• Request Date: {{rejectedDate}}
• Status: Additional Information Required

🔍 What we need:
{{reason}}

📝 Next Steps:
1. Review the feedback above
2. Gather the required documents or make necessary corrections
3. Submit a new verification request with the updated information

We want to help you get verified! If you have any questions about these requirements, please don't hesitate to contact our support team.

Thank you for your understanding.

Best regards,
The Gaming Portal Verification Team`,
      isActive: true,
      variables: JSON.stringify(['username', 'type', 'rejectedDate', 'reason']),
      createdBy: 1
    },
    {
      trigger: 'verification_rejected',
      channel: 'in_app',
      title: '📝 Verification Needs Update',
      content: `Hi {{displayName}}, your {{type}} verification needs some updates. Reason: {{reason}}. Please review and resubmit with the correct information. 💪`,
      isActive: true,
      variables: JSON.stringify(['displayName', 'type', 'reason']),
      createdBy: 1
    },

    // Welcome/Engagement Templates
    {
      trigger: 'welcome_message',
      channel: 'email',
      title: '🎮 Welcome to Gaming Portal - Let\'s Get Started!',
      content: `Welcome to Gaming Portal, {{username}}! 🎉

We're thrilled to have you join our amazing gaming community! Get ready for an incredible gaming experience.

🎮 What you can do now:
• Explore thousands of games in our library
• Connect with gamers worldwide
• Join voice chat rooms and make friends
• Earn diamonds and rewards
• Get verified with a Blue Badge

🔵 Pro Tip: Get verified to unlock exclusive features and boost your profile credibility!

Ready to dive in? Let's start gaming!

Best regards,
The Gaming Portal Team`,
      isActive: true,
      variables: JSON.stringify(['username']),
      createdBy: 1
    }
  ];

  for (const template of templates) {
    try {
      // Check if template already exists
      const existingTemplate = await db.select()
        .from(automatedMessageTemplates)
        .where(
          and(
            eq(automatedMessageTemplates.trigger, template.trigger),
            eq(automatedMessageTemplates.channel, template.channel),
            eq(automatedMessageTemplates.title, template.title)
          )
        )
        .limit(1);

      if (existingTemplate.length === 0) {
        await db.insert(automatedMessageTemplates).values(template);
        console.log(`✅ Created template: ${template.trigger} (${template.channel})`);
      } else {
        console.log(`ℹ️  Template already exists: ${template.trigger} (${template.channel})`);
      }
    } catch (error) {
      console.error(`❌ Error creating template ${template.trigger}:`, error);
    }
  }

  console.log("🎉 Automated message templates seeding completed!");
}