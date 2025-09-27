import { WebSocket } from 'ws';

// Global WebSocket connection management
export class WebSocketBroadcaster {
  private static instance: WebSocketBroadcaster;
  private roomConnections = new Map<string, Map<string, WebSocket>>();
  private userConnections = new Map<string, WebSocket>();

  private constructor() {}

  public static getInstance(): WebSocketBroadcaster {
    if (!WebSocketBroadcaster.instance) {
      WebSocketBroadcaster.instance = new WebSocketBroadcaster();
    }
    return WebSocketBroadcaster.instance;
  }

  // Add user to room
  public addUserToRoom(roomId: string, userId: string, ws: WebSocket) {
    if (!this.roomConnections.has(roomId)) {
      this.roomConnections.set(roomId, new Map());
    }
    this.roomConnections.get(roomId)!.set(userId, ws);
    console.log(`WebSocket: User ${userId} added to room ${roomId}`);
  }

  // Remove user from room
  public removeUserFromRoom(roomId: string, userId: string) {
    const roomUsers = this.roomConnections.get(roomId);
    if (roomUsers) {
      roomUsers.delete(userId);
      if (roomUsers.size === 0) {
        this.roomConnections.delete(roomId);
      }
      console.log(`WebSocket: User ${userId} removed from room ${roomId}`);
    }
  }

  // Add user to global connections
  public addUserConnection(userId: string, ws: WebSocket) {
    this.userConnections.set(userId, ws);
    console.log(`WebSocket: User ${userId} added to global connections`);
  }

  // Remove user from global connections
  public removeUserConnection(userId: string) {
    this.userConnections.delete(userId);
    console.log(`WebSocket: User ${userId} removed from global connections`);
  }

  // Broadcast message to all users in a room except sender
  public broadcastToRoom(roomId: string, message: any, excludeUserId?: string) {
    const roomUsers = this.roomConnections.get(roomId);
    if (roomUsers) {
      let sentCount = 0;
      roomUsers.forEach((userWs, userId) => {
        if (userId !== excludeUserId && userWs.readyState === WebSocket.OPEN) {
          userWs.send(JSON.stringify(message));
          sentCount++;
        }
      });
      console.log(`WebSocket: Broadcasted message to ${sentCount} users in room ${roomId}`);
    } else {
      console.log(`WebSocket: No users found in room ${roomId} for broadcasting`);
    }
  }

  // Send message to specific user
  public sendToUser(userId: string, message: any) {
    const userWs = this.userConnections.get(userId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(JSON.stringify(message));
      console.log(`WebSocket: Sent message to user ${userId}`);
      return true;
    }
    console.log(`WebSocket: User ${userId} not connected or connection closed`);
    return false;
  }

  // Get room connection count
  public getRoomUserCount(roomId: string): number {
    return this.roomConnections.get(roomId)?.size || 0;
  }

  // Get all room IDs
  public getAllRoomIds(): string[] {
    return Array.from(this.roomConnections.keys());
  }

  // Check if user is in room
  public isUserInRoom(roomId: string, userId: string): boolean {
    return this.roomConnections.get(roomId)?.has(userId) || false;
  }

  // Broadcast moderation events specifically
  public broadcastModerationEvent(roomId: string, event: {
    type: string;
    targetUserId?: string;
    moderatorId: string;
    [key: string]: any;
  }) {
    console.log(`WebSocket: Broadcasting moderation event ${event.type} in room ${roomId}`);
    this.broadcastToRoom(roomId, {
      ...event,
      timestamp: new Date().toISOString()
    });
  }

  // Force disconnect user from room (for kicks/bans)
  public forceDisconnectFromRoom(roomId: string, userId: string, reason?: string) {
    const roomUsers = this.roomConnections.get(roomId);
    const userWs = roomUsers?.get(userId);
    
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      // Send disconnect message to user
      userWs.send(JSON.stringify({
        type: 'force-disconnect',
        reason: reason || 'You have been removed from the room',
        roomId
      }));
      
      // Remove from room connections
      this.removeUserFromRoom(roomId, userId);
      console.log(`WebSocket: Force disconnected user ${userId} from room ${roomId}`);
      return true;
    }
    return false;
  }
}

// Export singleton instance for easy access
export const webSocketBroadcaster = WebSocketBroadcaster.getInstance();