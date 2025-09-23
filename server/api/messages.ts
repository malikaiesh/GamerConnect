import { Router, Request, Response } from 'express';
import { db } from "@db";
import { conversations, messages, messageReadStatus, conversationParticipants, users } from '@shared/schema';
import { insertConversationSchema, insertMessageSchema, insertMessageReadStatusSchema } from '@shared/schema';
import { eq, and, or, desc, asc, isNull, sql, count } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Get all conversations for the current user
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get conversations where the user is either user1 or user2, or is a participant
    const userConversations = await db
      .select({
        conversation: conversations,
        otherUser: {
          id: users.id,
          username: users.username,
          avatar: users.profilePicture,
          isVerified: users.isVerified,
          verificationExpiry: users.verificationExpiry
        },
        lastMessage: messages,
        unreadCount: sql<number>`
          CASE 
            WHEN ${conversations.user1Id} = ${userId} THEN ${conversations.user1UnreadCount}
            WHEN ${conversations.user2Id} = ${userId} THEN ${conversations.user2UnreadCount}
            ELSE 0
          END
        `.as('unread_count')
      })
      .from(conversations)
      .leftJoin(users, or(
        and(eq(conversations.user1Id, userId), eq(users.id, conversations.user2Id)),
        and(eq(conversations.user2Id, userId), eq(users.id, conversations.user1Id))
      ))
      .leftJoin(messages, eq(messages.id, conversations.lastMessageId))
      .where(or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ))
      .orderBy(desc(conversations.lastMessageAt));

    res.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or create a conversation with a specific user
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { otherUserId } = z.object({
      otherUserId: z.number()
    }).parse(req.body);

    if (otherUserId === userId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    let existingConversation = await db
      .select()
      .from(conversations)
      .where(or(
        and(eq(conversations.user1Id, userId), eq(conversations.user2Id, otherUserId)),
        and(eq(conversations.user1Id, otherUserId), eq(conversations.user2Id, userId))
      ))
      .limit(1);

    if (existingConversation.length > 0) {
      // Return existing conversation with other user info
      const otherUser = await db
        .select({
          id: users.id,
          username: users.username,
          avatar: users.profilePicture,
          isVerified: users.isVerified,
          verificationExpiry: users.verificationExpiry
        })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      return res.json({
        conversation: existingConversation[0],
        otherUser: otherUser[0]
      });
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        type: 'direct',
        user1Id: userId,
        user2Id: otherUserId,
        lastMessageAt: new Date()
      })
      .returning();

    // Get other user info
    const otherUser = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.profilePicture,
        isVerified: users.isVerified,
        verificationExpiry: users.verificationExpiry
      })
      .from(users)
      .where(eq(users.id, otherUserId))
      .limit(1);

    res.json({
      conversation: newConversation,
      otherUser: otherUser[0]
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({ error: 'Failed to create/get conversation' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.conversationId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get messages with sender info
    const conversationMessages = await db
      .select({
        message: messages,
        sender: {
          id: users.id,
          username: users.username,
          avatar: users.profilePicture,
          isVerified: users.isVerified,
          verificationExpiry: users.verificationExpiry
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [totalCount] = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      );

    res.json({
      messages: conversationMessages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.conversationId);
    
    const messageData = insertMessageSchema.parse({
      ...req.body,
      conversationId,
      senderId: userId
    });

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Set receiverId for direct messages
    const receiverId = conversation[0].user1Id === userId 
      ? conversation[0].user2Id 
      : conversation[0].user1Id;

    // Insert message
    const [newMessage] = await db
      .insert(messages)
      .values({
        ...messageData,
        receiverId,
        status: 'sent'
      })
      .returning();

    // Update conversation last message info and increment unread count for the receiver
    await db
      .update(conversations)
      .set({
        lastMessageId: newMessage.id,
        lastMessageAt: new Date(),
        user1UnreadCount: conversation[0].user1Id === receiverId 
          ? sql`${conversations.user1UnreadCount} + 1`
          : conversations.user1UnreadCount,
        user2UnreadCount: conversation[0].user2Id === receiverId
          ? sql`${conversations.user2UnreadCount} + 1`
          : conversations.user2UnreadCount
      })
      .where(eq(conversations.id, conversationId));

    // Get sender info for response
    const sender = await db
      .select({
        id: users.id,
        username: users.username,
        avatar: users.profilePicture,
        isVerified: users.isVerified,
        verificationExpiry: users.verificationExpiry
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.json({
      message: newMessage,
      sender: sender[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/conversations/:conversationId/read', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const conversationId = parseInt(req.params.conversationId);
    const { messageIds } = z.object({
      messageIds: z.array(z.number()).optional()
    }).parse(req.body);

    // Verify user has access to this conversation
    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.user1Id, userId),
            eq(conversations.user2Id, userId)
          )
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Mark specific messages as read or all unread messages if no messageIds provided
    if (messageIds && messageIds.length > 0) {
      // Mark specific messages as read
      for (const messageId of messageIds) {
        await db
          .insert(messageReadStatus)
          .values({
            messageId,
            userId,
            readAt: new Date()
          })
          .onConflictDoNothing();
      }
    } else {
      // Mark all unread messages in this conversation as read
      const unreadMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .leftJoin(messageReadStatus, and(
          eq(messageReadStatus.messageId, messages.id),
          eq(messageReadStatus.userId, userId)
        ))
        .where(
          and(
            eq(messages.conversationId, conversationId),
            eq(messages.isDeleted, false),
            isNull(messageReadStatus.id) // Message not read by this user
          )
        );

      for (const msg of unreadMessages) {
        await db
          .insert(messageReadStatus)
          .values({
            messageId: msg.id,
            userId,
            readAt: new Date()
          })
          .onConflictDoNothing();
      }
    }

    // Reset unread count for this user in the conversation
    await db
      .update(conversations)
      .set({
        user1UnreadCount: conversation[0].user1Id === userId ? 0 : conversations.user1UnreadCount,
        user2UnreadCount: conversation[0].user2Id === userId ? 0 : conversations.user2UnreadCount
      })
      .where(eq(conversations.id, conversationId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Edit a message
router.put('/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const messageId = parseInt(req.params.messageId);
    const { content } = z.object({
      content: z.string().min(1).max(5000)
    }).parse(req.body);

    // Verify user owns this message
    const message = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId),
          eq(messages.isDeleted, false)
        )
      )
      .limit(1);

    if (message.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    // Update message
    const [updatedMessage] = await db
      .update(messages)
      .set({
        content,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId))
      .returning();

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

// Delete a message
router.delete('/messages/:messageId', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const messageId = parseInt(req.params.messageId);

    // Verify user owns this message
    const message = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId),
          eq(messages.isDeleted, false)
        )
      )
      .limit(1);

    if (message.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    // Soft delete message
    await db
      .update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(messages.id, messageId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Get user's total unread message count
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [result] = await db
      .select({
        totalUnreadCount: sql<number>`
          COALESCE(SUM(
            CASE 
              WHEN ${conversations.user1Id} = ${userId} THEN ${conversations.user1UnreadCount}
              WHEN ${conversations.user2Id} = ${userId} THEN ${conversations.user2UnreadCount}
              ELSE 0
            END
          ), 0)
        `.as('total_unread_count')
      })
      .from(conversations)
      .where(or(
        eq(conversations.user1Id, userId),
        eq(conversations.user2Id, userId)
      ));

    res.json({ unreadCount: result.totalUnreadCount || 0 });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

export default router;