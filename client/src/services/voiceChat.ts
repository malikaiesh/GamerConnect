export class VoiceChatService {
  private ws: WebSocket | null = null;
  private localStream: MediaStream | null = null;
  private peerConnections = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();
  private roomId: string | null = null;
  private userId: string | null = null;
  private isMicEnabled = false;
  private onMicToggle?: (enabled: boolean) => void;
  private onUserJoined?: (userId: string) => void;
  private onUserLeft?: (userId: string) => void;

  // ICE servers for WebRTC
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  constructor() {
    console.log('VoiceChatService: Initializing...');
    this.setupWebSocket();
  }

  private setupWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('VoiceChatService: Attempting WebSocket connection to:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);
    } catch (error) {
      console.error('VoiceChatService: Failed to create WebSocket:', error);
      return;
    }

    this.ws.onopen = () => {
      console.log('VoiceChatService: WebSocket connected successfully');
      // Auto-join room if we have the info
      if (this.roomId && this.userId) {
        this.sendWebSocketMessage({
          type: 'join-room',
          roomId: this.roomId,
          userId: this.userId
        });
      }
    };

    this.ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('VoiceChatService: Received message:', message);
        await this.handleSignalingMessage(message);
      } catch (error) {
        console.error('VoiceChatService: Error handling WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('VoiceChatService: WebSocket disconnected', event.code, event.reason);
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.setupWebSocket(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('VoiceChatService: WebSocket error:', error);
    };
  }

  private async handleSignalingMessage(message: any) {
    switch (message.type) {
      case 'user-joined':
        this.onUserJoined?.(message.userId);
        // Initiate WebRTC connection to new user
        if (this.localStream && message.userId !== this.userId) {
          await this.createPeerConnection(message.userId, true);
        }
        break;

      case 'user-left':
        this.onUserLeft?.(message.userId);
        this.closePeerConnection(message.userId);
        break;

      case 'webrtc-offer':
        await this.handleOffer(message);
        break;

      case 'webrtc-answer':
        await this.handleAnswer(message);
        break;

      case 'webrtc-ice-candidate':
        await this.handleIceCandidate(message);
        break;

      case 'user-mic-toggle':
        // Handle remote user mic toggle
        console.log(`User ${message.userId} ${message.isMicOn ? 'enabled' : 'disabled'} mic`);
        break;
    }
  }

  async joinRoom(roomId: string, userId: string) {
    console.log(`VoiceChatService: Joining room ${roomId} as user ${userId}`);
    this.roomId = roomId;
    this.userId = userId;

    // Get user media (microphone access)
    try {
      console.log('VoiceChatService: Requesting microphone access...');
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      // Initially mute the microphone
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });

      console.log('VoiceChatService: Microphone access granted, tracks:', this.localStream.getAudioTracks().length);
    } catch (error) {
      console.error('VoiceChatService: Error accessing microphone:', error);
      throw new Error('Could not access microphone. Please check permissions.');
    }

    // Join room via WebSocket
    this.sendWebSocketMessage({
      type: 'join-room',
      roomId,
      userId
    });
  }

  private sendWebSocketMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('VoiceChatService: Sending message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('VoiceChatService: WebSocket not ready, message not sent:', message);
    }
  }

  async toggleMicrophone(): Promise<boolean> {
    if (!this.localStream) {
      console.error('VoiceChatService: No audio stream available for mic toggle');
      throw new Error('No audio stream available');
    }

    this.isMicEnabled = !this.isMicEnabled;
    
    // Enable/disable audio tracks
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = this.isMicEnabled;
      console.log(`VoiceChatService: Audio track ${track.id} enabled: ${track.enabled}`);
    });

    // Notify other users via WebSocket
    this.sendWebSocketMessage({
      type: 'mic-toggle',
      isMicOn: this.isMicEnabled
    });

    this.onMicToggle?.(this.isMicEnabled);
    console.log(`VoiceChatService: Microphone ${this.isMicEnabled ? 'enabled' : 'disabled'}`);
    
    return this.isMicEnabled;
  }

  private async createPeerConnection(targetUserId: string, createOffer: boolean) {
    const peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });
    this.peerConnections.set(targetUserId, peerConnection);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      this.remoteStreams.set(targetUserId, remoteStream);
      
      // Play remote audio
      const audioElement = new Audio();
      audioElement.srcObject = remoteStream;
      audioElement.play().catch(error => {
        console.error('Error playing remote audio:', error);
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'webrtc-ice-candidate',
          targetUserId,
          candidate: event.candidate
        }));
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${targetUserId}:`, peerConnection.connectionState);
    };

    // Create offer if initiating
    if (createOffer) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'webrtc-offer',
            targetUserId,
            offer
          }));
        }
      } catch (error) {
        console.error('Error creating offer:', error);
      }
    }
  }

  private async handleOffer(message: any) {
    const { fromUserId, offer } = message;
    
    if (!this.peerConnections.has(fromUserId)) {
      await this.createPeerConnection(fromUserId, false);
    }

    const peerConnection = this.peerConnections.get(fromUserId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'webrtc-answer',
            targetUserId: fromUserId,
            answer
          }));
        }
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  }

  private async handleAnswer(message: any) {
    const { fromUserId, answer } = message;
    const peerConnection = this.peerConnections.get(fromUserId);
    
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }

  private async handleIceCandidate(message: any) {
    const { fromUserId, candidate } = message;
    const peerConnection = this.peerConnections.get(fromUserId);
    
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  }

  private closePeerConnection(userId: string) {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
    this.remoteStreams.delete(userId);
  }

  leaveRoom() {
    // Close all peer connections
    this.peerConnections.forEach((pc, userId) => {
      this.closePeerConnection(userId);
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.roomId = null;
    this.userId = null;
    this.isMicEnabled = false;
  }

  // Event handlers
  onMicrophoneToggle(callback: (enabled: boolean) => void) {
    this.onMicToggle = callback;
  }

  onUserJoinedVoice(callback: (userId: string) => void) {
    this.onUserJoined = callback;
  }

  onUserLeftVoice(callback: (userId: string) => void) {
    this.onUserLeft = callback;
  }

  isMicrophoneEnabled(): boolean {
    return this.isMicEnabled;
  }

  hasAudioPermission(): boolean {
    return this.localStream !== null;
  }
}

// Export singleton instance
export const voiceChatService = new VoiceChatService();