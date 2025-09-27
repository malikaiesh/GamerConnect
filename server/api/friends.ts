import { Router, Request, Response } from "express";
import { db } from "@db";
import { 
  userRelationships,
  users,
} from "@shared/schema";
import { eq, desc, and, sql, count, gte, sum, asc, or, ne } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Get user's friends
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const friends = await db
      .select({
        relationshipId: userRelationships.id,
        friendId: users.id,
        friendUsername: users.username,
        friendDisplayName: users.displayName,
        friendProfilePicture: users.profilePicture,
        friendIsVerified: users.isVerified,
        friendBio: users.bio,
        friendCountry: users.country,
        friendLastLogin: users.lastLogin,
        friendsSince: userRelationships.createdAt
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.targetUserId, users.id))
      .where(and(
        eq(userRelationships.userId, userId),
        eq(userRelationships.relationshipType, 'friend'),
        eq(userRelationships.status, 'accepted')
      ))
      .orderBy(desc(userRelationships.createdAt));

    // Transform to expected format
    const formattedFriends = friends.map(f => ({
      id: f.friendId,
      username: f.friendUsername,
      displayName: f.friendDisplayName,
      profilePicture: f.friendProfilePicture,
      isVerified: f.friendIsVerified,
      bio: f.friendBio,
      country: f.friendCountry,
      status: f.friendLastLogin && new Date(f.friendLastLogin) > new Date(Date.now() - 15 * 60 * 1000) ? 'online' : 'offline',
      lastSeen: f.friendLastLogin || f.friendsSince,
      friendsSince: f.friendsSince,
      currentRoom: null // TODO: Add room status integration
    }));

    res.json(formattedFriends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Get all users for Find Friends page (exclude current user and existing relationships)
router.get("/discover", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get all existing relationships for current user
    const existingRelationships = await db
      .select({ targetUserId: userRelationships.targetUserId })
      .from(userRelationships)
      .where(eq(userRelationships.userId, userId));

    const existingUserIds = existingRelationships.map(rel => rel.targetUserId);
    
    // Get all users except current user and those with existing relationships
    let query = db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
        isVerified: users.isVerified,
        createdAt: users.createdAt,
        bio: users.bio,
        country: users.country,
        lastLogin: users.lastLogin
      })
      .from(users)
      .where(and(
        ne(users.id, userId),
        eq(users.status, 'active')
      ));

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(100); // Limit to prevent overwhelming response

    // Filter out users with existing relationships
    const filteredUsers = allUsers.filter(user => !existingUserIds.includes(user.id));

    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users for discovery:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get friend suggestions
router.get("/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get users who have mutual friends (simplified version)
    const suggestions = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profilePicture: users.profilePicture,
        isVerified: users.isVerified,
        bio: users.bio,
        country: users.country
      })
      .from(users)
      .where(and(
        ne(users.id, userId),
        eq(users.status, 'active')
      ))
      .orderBy(desc(users.createdAt))
      .limit(10);

    // For now, add mock mutual friends count
    const formattedSuggestions = suggestions.map(user => ({
      ...user,
      mutualFriends: Math.floor(Math.random() * 5) // TODO: Calculate real mutual friends
    }));

    res.json(formattedSuggestions);
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    res.status(500).json({ error: "Failed to fetch friend suggestions" });
  }
});

// Send friend request
router.post("/request", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: "Target user ID is required" });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Check if target user exists
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if relationship already exists
    const existingRelationship = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.userId, userId),
        eq(userRelationships.targetUserId, targetUserId)
      ))
      .limit(1);

    if (existingRelationship.length > 0) {
      return res.status(400).json({ 
        error: "Relationship already exists",
        type: existingRelationship[0].relationshipType,
        status: existingRelationship[0].status
      });
    }

    // Create friend request
    const [friendRequest] = await db
      .insert(userRelationships)
      .values({
        userId,
        targetUserId,
        relationshipType: 'friend_request',
        status: 'pending'
      })
      .returning();

    res.status(201).json({
      message: "Friend request sent successfully",
      relationship: friendRequest
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Get incoming friend requests (requests sent to current user)
router.get("/requests/incoming", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const incomingRequests = await db
      .select({
        id: userRelationships.id,
        senderId: userRelationships.userId,
        receiverId: userRelationships.targetUserId,
        relationshipType: userRelationships.relationshipType,
        status: userRelationships.status,
        createdAt: userRelationships.createdAt,
        senderUsername: users.username,
        senderDisplayName: users.displayName,
        senderProfilePicture: users.profilePicture,
        senderIsVerified: users.isVerified,
        senderLastLogin: users.lastLogin
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.userId, users.id))
      .where(and(
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .orderBy(desc(userRelationships.createdAt));

    res.json(incomingRequests);
  } catch (error) {
    console.error("Error fetching incoming friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Get friend requests (legacy endpoint for backward compatibility)
router.get("/requests", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const incomingRequests = await db
      .select({
        id: userRelationships.id,
        senderId: userRelationships.userId,
        receiverId: userRelationships.targetUserId,
        status: userRelationships.status,
        createdAt: userRelationships.createdAt,
        senderUsername: users.username,
        senderDisplayName: users.displayName,
        senderProfilePicture: users.profilePicture,
        senderIsVerified: users.isVerified,
        senderLastLogin: users.lastLogin
      })
      .from(userRelationships)
      .innerJoin(users, eq(userRelationships.userId, users.id))
      .where(and(
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .orderBy(desc(userRelationships.createdAt));

    res.json(incomingRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Accept friend request
router.post("/requests/:requestId/accept", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the friend request
    const friendRequest = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.id, parseInt(requestId)),
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .limit(1);

    if (friendRequest.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    const request = friendRequest[0];

    // Update the original request to accepted friend relationship
    await db
      .update(userRelationships)
      .set({
        relationshipType: 'friend',
        status: 'accepted',
        updatedAt: new Date()
      })
      .where(eq(userRelationships.id, request.id));

    // Create reciprocal friendship
    await db
      .insert(userRelationships)
      .values({
        userId: request.targetUserId,
        targetUserId: request.userId,
        relationshipType: 'friend',
        status: 'accepted'
      });

    res.json({ message: "Friend request accepted successfully" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// Reject friend request
router.post("/requests/:requestId/reject", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get the friend request
    const friendRequest = await db
      .select()
      .from(userRelationships)
      .where(and(
        eq(userRelationships.id, parseInt(requestId)),
        eq(userRelationships.targetUserId, userId),
        eq(userRelationships.relationshipType, 'friend_request'),
        eq(userRelationships.status, 'pending')
      ))
      .limit(1);

    if (friendRequest.length === 0) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Reject the request
    await db
      .update(userRelationships)
      .set({
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(userRelationships.id, parseInt(requestId)));

    res.json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

// Remove friend
router.delete("/remove/:friendId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { friendId } = req.params;

    // Remove both directions of the friendship
    await db
      .delete(userRelationships)
      .where(or(
        and(
          eq(userRelationships.userId, userId),
          eq(userRelationships.targetUserId, parseInt(friendId)),
          eq(userRelationships.relationshipType, 'friend')
        ),
        and(
          eq(userRelationships.userId, parseInt(friendId)),
          eq(userRelationships.targetUserId, userId),
          eq(userRelationships.relationshipType, 'friend')
        )
      ));

    res.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;