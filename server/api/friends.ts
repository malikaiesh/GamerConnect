import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  friendRequests,
  friends,
  users,
} from "@shared/schema";
import { eq, desc, and, sql, count, gte, sum, asc, or } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Get user's friends
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Mock friends data for now
    const mockFriends = [
      {
        id: 1,
        username: "john_gamer",
        displayName: "John Smith",
        status: 'online',
        lastSeen: new Date().toISOString(),
        friendsSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentRoom: null
      },
      {
        id: 2,
        username: "sarah_plays",
        displayName: "Sarah Johnson",
        status: 'in-room',
        lastSeen: new Date().toISOString(),
        friendsSince: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        currentRoom: {
          roomId: "ABC123",
          name: "Gaming Lounge"
        }
      },
      {
        id: 3,
        username: "mike_pro",
        displayName: "Mike Chen",
        status: 'in-game',
        lastSeen: new Date().toISOString(),
        friendsSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        currentRoom: null
      }
    ];

    res.json(mockFriends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Get friend suggestions
router.get("/suggestions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Mock friend suggestions
    const mockSuggestions = [
      {
        id: 4,
        username: "alex_stream",
        displayName: "Alex Rivera",
        mutualFriends: 2
      },
      {
        id: 5,
        username: "emma_games",
        displayName: "Emma Wilson",
        mutualFriends: 1
      },
      {
        id: 6,
        username: "chris_pro",
        displayName: "Chris Taylor",
        mutualFriends: 3
      }
    ];

    res.json(mockSuggestions);
  } catch (error) {
    console.error("Error fetching friend suggestions:", error);
    res.status(500).json({ error: "Failed to fetch friend suggestions" });
  }
});

// Get friend requests
router.get("/requests", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Mock friend requests
    const mockRequests = [
      {
        id: 1,
        senderId: 7,
        receiverId: userId,
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 7,
          username: "david_gamer",
          displayName: "David Brown",
          status: 'online'
        }
      },
      {
        id: 2,
        senderId: 8,
        receiverId: userId,
        status: 'pending',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        sender: {
          id: 8,
          username: "lisa_plays",
          displayName: "Lisa Davis",
          status: 'offline'
        }
      }
    ];

    res.json(mockRequests);
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

    // Mock acceptance
    console.log(`User ${userId} accepted friend request ${requestId}`);

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

    // Mock rejection
    console.log(`User ${userId} rejected friend request ${requestId}`);

    res.json({ message: "Friend request rejected successfully" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

export default router;