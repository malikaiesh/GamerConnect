import { Request, Response } from 'express';
import { db } from '../db';
import { verificationRequests, pricingPlans, users, rooms, insertVerificationRequestSchema } from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { automatedMessaging } from '../services/automated-messaging';

// Get all verification requests (Admin only)
export const getVerificationRequests = async (req: Request, res: Response) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    
    let whereClause = sql`1=1`;
    
    if (status && status !== 'all') {
      whereClause = and(whereClause, eq(verificationRequests.status, status as any));
    }
    
    if (type && type !== 'all') {
      whereClause = and(whereClause, eq(verificationRequests.requestType, type as any));
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const requests = await db
      .select({
        id: verificationRequests.id,
        requestType: verificationRequests.requestType,
        status: verificationRequests.status,
        username: verificationRequests.username,
        roomIdText: verificationRequests.roomIdText,
        reason: verificationRequests.reason,
        additionalInfo: verificationRequests.additionalInfo,
        paymentStatus: verificationRequests.paymentStatus,
        reviewNotes: verificationRequests.reviewNotes,
        adminFeedback: verificationRequests.adminFeedback,
        createdAt: verificationRequests.createdAt,
        updatedAt: verificationRequests.updatedAt,
        reviewedAt: verificationRequests.reviewedAt,
        // Related data
        pricingPlan: {
          id: pricingPlans.id,
          displayName: pricingPlans.displayName,
          price: pricingPlans.price,
          currency: pricingPlans.currency,
        },
        reviewedByUser: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        }
      })
      .from(verificationRequests)
      .leftJoin(pricingPlans, eq(verificationRequests.pricingPlanId, pricingPlans.id))
      .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
      .where(whereClause)
      .orderBy(desc(verificationRequests.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(whereClause);

    res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
        hasMore: offset + Number(limit) < count
      }
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
};

// Get single verification request (Admin only)
export const getVerificationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [request] = await db
      .select({
        id: verificationRequests.id,
        requestType: verificationRequests.requestType,
        status: verificationRequests.status,
        userId: verificationRequests.userId,
        username: verificationRequests.username,
        roomId: verificationRequests.roomId,
        roomIdText: verificationRequests.roomIdText,
        documents: verificationRequests.documents,
        reason: verificationRequests.reason,
        additionalInfo: verificationRequests.additionalInfo,
        pricingPlanId: verificationRequests.pricingPlanId,
        paymentTransactionId: verificationRequests.paymentTransactionId,
        paymentStatus: verificationRequests.paymentStatus,
        reviewedBy: verificationRequests.reviewedBy,
        reviewedAt: verificationRequests.reviewedAt,
        reviewNotes: verificationRequests.reviewNotes,
        adminFeedback: verificationRequests.adminFeedback,
        metadata: verificationRequests.metadata,
        createdAt: verificationRequests.createdAt,
        updatedAt: verificationRequests.updatedAt,
        // Related data
        pricingPlan: {
          id: pricingPlans.id,
          displayName: pricingPlans.displayName,
          price: pricingPlans.price,
          currency: pricingPlans.currency,
          features: pricingPlans.features,
        },
        reviewedByUser: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          isVerified: users.isVerified,
        },
        room: {
          id: rooms.id,
          roomId: rooms.roomId,
          name: rooms.name,
          isVerified: rooms.isVerified,
        }
      })
      .from(verificationRequests)
      .leftJoin(pricingPlans, eq(verificationRequests.pricingPlanId, pricingPlans.id))
      .leftJoin(users, eq(verificationRequests.reviewedBy, users.id))
      .leftJoin(users, eq(verificationRequests.userId, users.id))
      .leftJoin(rooms, eq(verificationRequests.roomId, rooms.id))
      .where(eq(verificationRequests.id, parseInt(id)))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching verification request:', error);
    res.status(500).json({ error: 'Failed to fetch verification request' });
  }
};

// Create verification request (Public)
export const createVerificationRequest = async (req: Request, res: Response) => {
  try {
    const validatedData = insertVerificationRequestSchema.parse(req.body);
    
    // Get user ID from session if authenticated
    const userId = (req as any).user?.id || null;
    
    // If requesting user verification, find the user by username
    let targetUserId = userId;
    if (validatedData.requestType === 'user' && validatedData.username) {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, validatedData.username))
        .limit(1);
      
      if (user) {
        targetUserId = user.id;
      }
    }
    
    // If requesting room verification, find the room by roomId
    let targetRoomId = null;
    if (validatedData.requestType === 'room' && validatedData.roomIdText) {
      const [room] = await db
        .select({ id: rooms.id })
        .from(rooms)
        .where(eq(rooms.roomId, validatedData.roomIdText))
        .limit(1);
      
      if (room) {
        targetRoomId = room.id;
      }
    }

    // Process document data
    let documentsData: any = {};
    
    // For user verification with international payment, process ID documents
    if (validatedData.requestType === 'user' && req.body.documentType && req.body.frontImageUrl && req.body.backImageUrl) {
      documentsData.idDocuments = {
        documentType: req.body.documentType,
        frontImage: req.body.frontImageUrl,
        backImage: req.body.backImageUrl,
      };
    }

    // Handle payment screenshot for local payments
    if (req.body.paymentScreenshot) {
      documentsData.identityProof = req.body.paymentScreenshot;
    }

    // Extract IP address and user agent for metadata
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    const [newRequest] = await db
      .insert(verificationRequests)
      .values({
        ...validatedData,
        userId: targetUserId,
        roomId: targetRoomId,
        documents: documentsData,
        status: 'pending',
        paymentStatus: 'pending',
        metadata: {
          ipAddress,
          userAgent,
          submissionSource: 'web',
          priority: 'normal',
        }
      })
      .returning();

    // Trigger automated messaging for verification request processing
    if (targetUserId) {
      try {
        await automatedMessaging.triggerVerificationProcessing({
          userId: targetUserId,
          requestId: newRequest.id,
          type: validatedData.requestType
        });
      } catch (error) {
        console.error('Error sending verification processing message:', error);
        // Don't fail the main operation if messaging fails
      }
    }

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating verification request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    res.status(500).json({ error: 'Failed to create verification request' });
  }
};

// Update verification request status (Admin only)
export const updateVerificationRequestStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const updateSchema = z.object({
      status: z.enum(['pending', 'approved', 'rejected', 'under_review']),
      reviewNotes: z.string().optional(),
      adminFeedback: z.string().optional(),
    });

    const validatedData = updateSchema.parse(req.body);

    const [updatedRequest] = await db
      .update(verificationRequests)
      .set({
        status: validatedData.status,
        reviewNotes: validatedData.reviewNotes,
        adminFeedback: validatedData.adminFeedback,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(verificationRequests.id, parseInt(id)))
      .returning();

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    // If approved, update the actual user/room verification status
    if (validatedData.status === 'approved') {
      if (updatedRequest.requestType === 'user' && updatedRequest.userId) {
        await db
          .update(users)
          .set({
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: adminId,
            updatedAt: new Date(),
          })
          .where(eq(users.id, updatedRequest.userId));
      } else if (updatedRequest.requestType === 'room' && updatedRequest.roomId) {
        await db
          .update(rooms)
          .set({
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: adminId,
            updatedAt: new Date(),
          })
          .where(eq(rooms.id, updatedRequest.roomId));
      }
    }

    res.json({ 
      message: `Verification request ${validatedData.status} successfully`,
      request: updatedRequest 
    });
  } catch (error) {
    console.error('Error updating verification request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    res.status(500).json({ error: 'Failed to update verification request' });
  }
};

// Delete verification request (Admin only)
export const deleteVerificationRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [deletedRequest] = await db
      .delete(verificationRequests)
      .where(eq(verificationRequests.id, parseInt(id)))
      .returning({ id: verificationRequests.id });

    if (!deletedRequest) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.json({ message: 'Verification request deleted successfully' });
  } catch (error) {
    console.error('Error deleting verification request:', error);
    res.status(500).json({ error: 'Failed to delete verification request' });
  }
};

// Get verification statistics (Admin only)
export const getVerificationStats = async (req: Request, res: Response) => {
  try {
    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));

    const [approvedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'approved'));

    const [rejectedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'rejected'));

    const [underReviewCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'under_review'));

    const [totalUserRequests] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.requestType, 'user'));

    const [totalRoomRequests] = await db
      .select({ count: sql<number>`count(*)` })
      .from(verificationRequests)
      .where(eq(verificationRequests.requestType, 'room'));

    res.json({
      byStatus: {
        pending: pendingCount.count,
        approved: approvedCount.count,
        rejected: rejectedCount.count,
        under_review: underReviewCount.count,
      },
      byType: {
        user: totalUserRequests.count,
        room: totalRoomRequests.count,
      },
      total: pendingCount.count + approvedCount.count + rejectedCount.count + underReviewCount.count
    });
  } catch (error) {
    console.error('Error fetching verification statistics:', error);
    res.status(500).json({ error: 'Failed to fetch verification statistics' });
  }
};