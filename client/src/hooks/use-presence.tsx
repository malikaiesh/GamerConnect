import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface PresenceUpdate {
  type: 'presence-update';
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'in_room';
  currentRoomId?: string | null;
  timestamp: string;
}

interface UsePresenceReturn {
  isConnected: boolean;
  updatePresence: (status: string, currentRoomId?: string) => void;
  friendsPresence: Map<string, PresenceUpdate>;
}

export function usePresence(userId: string | null): UsePresenceReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [friendsPresence, setFriendsPresence] = useState<Map<string, PresenceUpdate>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Helper function to get session token from cookie
  const getSessionTokenFromCookie = () => {
    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'connect.sid') {
          // Decode the session cookie - in production you'd properly parse this
          // For now, we'll use a simpler approach
          return decodeURIComponent(value);
        }
      }
      return null;
    } catch (error) {
      console.error('Error extracting session token:', error);
      return null;
    }
  };

  const connect = useCallback(() => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Presence WebSocket connected');
        
        // Authenticate with session token from cookie
        const sessionToken = getSessionTokenFromCookie();
        if (sessionToken) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            sessionToken: sessionToken
          }));
        } else {
          console.error('No session token found for WebSocket authentication');
          setIsConnected(false);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth-success':
              console.log('WebSocket authenticated successfully');
              setIsConnected(true);
              break;
              
            case 'auth-error':
              console.error('WebSocket authentication failed:', message.message);
              setIsConnected(false);
              ws.close();
              break;
              
            case 'presence-updated':
              console.log('Presence update confirmed:', message.status);
              break;
              
            case 'presence-update':
              const presenceUpdate: PresenceUpdate = message;
              
              setFriendsPresence(prev => {
                const newMap = new Map(prev);
                newMap.set(presenceUpdate.userId, presenceUpdate);
                return newMap;
              });

              // Update React Query cache for accepted friends
              queryClient.setQueryData(['/api/friends/accepted'], (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                
                return oldData.map((friend: any) => {
                  if (friend.id.toString() === presenceUpdate.userId) {
                    return {
                      ...friend,
                      status: presenceUpdate.status,
                      currentRoom: presenceUpdate.currentRoomId ? {
                        id: presenceUpdate.currentRoomId,
                        canJoin: true
                      } : null
                    };
                  }
                  return friend;
                });
              });
              break;
              
            case 'error':
              console.error('WebSocket error:', message.message);
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Presence WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Reconnect if not a clean close (unless manually closed)
        if (event.code !== 1000 && userId) {
          console.log('Attempting to reconnect presence WebSocket in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('Presence WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect presence WebSocket:', error);
    }
  }, [userId, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000); // Clean close
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const updatePresence = useCallback((status: string, currentRoomId?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'update-presence',
        status,
        currentRoomId
      }));
    }
  }, []);

  // Connect/disconnect based on userId
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    updatePresence,
    friendsPresence
  };
}