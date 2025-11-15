import { Server } from 'socket.io';

class WebSocketService {
  constructor() {
    this.io = null;
    this.connections = new Map(); // Map of socket.id -> { walletAddress, escrowRooms, socket }
    this.typingUsers = new Map(); // Map of escrowId -> Set of wallet addresses
    this.typingTimeouts = new Map(); // Map of `${escrowId}_${walletAddress}` -> timeout
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Connection authentication middleware
    this.io.use((socket, next) => {
      const walletAddress = socket.handshake.auth.walletAddress;
      
      if (!walletAddress) {
        console.log('❌ WebSocket connection rejected: No wallet address provided');
        return next(new Error('Authentication required: wallet address missing'));
      }
      
      // Store wallet address in socket data
      socket.data.walletAddress = walletAddress;
      console.log(`✅ WebSocket authenticated: ${walletAddress.substring(0, 8)}...`);
      next();
    });

    this.io.on('connection', (socket) => {
      const walletAddress = socket.data.walletAddress;
      
      console.log(`🔌 Client connected: ${socket.id} (${walletAddress.substring(0, 8)}...)`);
      
      // Store connection info
      this.connections.set(socket.id, {
        walletAddress,
        escrowRooms: new Set(),
        socket,
        connectedAt: new Date()
      });
      
      // Auto-subscribe to user's personal room for notifications
      socket.join(`user:${walletAddress}`);
      console.log(`📬 Socket ${socket.id} subscribed to user room: ${walletAddress.substring(0, 8)}...`);
      
      // Handle escrow room subscription
      socket.on('subscribe_escrow', (escrowId) => {
        if (!escrowId) {
          console.log(`⚠️ Invalid escrow subscription attempt by ${socket.id}`);
          return;
        }
        
        const roomName = `escrow_${escrowId}`;
        socket.join(roomName);
        
        const connectionInfo = this.connections.get(socket.id);
        if (connectionInfo) {
          connectionInfo.escrowRooms.add(escrowId);
        }
        
        console.log(`📝 Socket ${socket.id} subscribed to escrow: ${escrowId}`);
        
        // Notify others in the room that user joined
        socket.to(roomName).emit('user_joined', {
          walletAddress,
          timestamp: new Date()
        });
      });
      
      // Handle escrow room unsubscription
      socket.on('unsubscribe_escrow', (escrowId) => {
        if (!escrowId) return;
        
        const roomName = `escrow_${escrowId}`;
        socket.leave(roomName);
        
        const connectionInfo = this.connections.get(socket.id);
        if (connectionInfo) {
          connectionInfo.escrowRooms.delete(escrowId);
        }
        
        console.log(`📤 Socket ${socket.id} unsubscribed from escrow: ${escrowId}`);
        
        // Notify others that user left
        socket.to(roomName).emit('user_left', {
          walletAddress,
          timestamp: new Date()
        });
      });
      
      // Handle chat messages (real-time broadcast)
      socket.on('chat_message', async (data) => {
        const { escrowId, content } = data;
        
        if (!escrowId || !content) {
          console.log(`⚠️ Invalid chat message from ${socket.id}`);
          return;
        }
        
        const roomName = `escrow_${escrowId}`;
        
        // Broadcast message to all in the room (including sender for confirmation)
        this.io.to(roomName).emit('chat_message', {
          id: Date.now().toString(),
          escrowId,
          senderId: walletAddress,
          content,
          timestamp: new Date(),
          read: false
        });
        
        console.log(`💬 Chat message in escrow ${escrowId} from ${walletAddress.substring(0, 8)}...`);
        
        // Clear typing indicator for this user
        this.clearTypingIndicator(escrowId, walletAddress);
      });
      
      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { escrowId } = data;
        
        if (!escrowId) return;
        
        // Add user to typing set
        if (!this.typingUsers.has(escrowId)) {
          this.typingUsers.set(escrowId, new Set());
        }
        this.typingUsers.get(escrowId).add(walletAddress);
        
        // Broadcast typing indicator to others in the room
        socket.to(`escrow_${escrowId}`).emit('user_typing', {
          escrowId,
          walletAddress,
          isTyping: true
        });
        
        // Set timeout to auto-clear typing indicator after 3 seconds
        const timeoutKey = `${escrowId}_${walletAddress}`;
        if (this.typingTimeouts.has(timeoutKey)) {
          clearTimeout(this.typingTimeouts.get(timeoutKey));
        }
        
        const timeout = setTimeout(() => {
          this.clearTypingIndicator(escrowId, walletAddress);
        }, 3000);
        
        this.typingTimeouts.set(timeoutKey, timeout);
      });
      
      socket.on('typing_stop', (data) => {
        const { escrowId } = data;
        
        if (!escrowId) return;
        
        this.clearTypingIndicator(escrowId, walletAddress);
      });
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (${walletAddress.substring(0, 8)}...) - Reason: ${reason}`);
        
        const connectionInfo = this.connections.get(socket.id);
        
        if (connectionInfo) {
          // Clear typing indicators for all escrows this user was in
          connectionInfo.escrowRooms.forEach(escrowId => {
            this.clearTypingIndicator(escrowId, walletAddress);
            
            // Notify others that user left
            socket.to(`escrow_${escrowId}`).emit('user_left', {
              walletAddress,
              timestamp: new Date()
            });
          });
          
          // Remove connection
          this.connections.delete(socket.id);
        }
        
        console.log(`📊 Active connections: ${this.connections.size}`);
      });
      
      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });

    console.log('🚀 WebSocket service initialized');
    return this.io;
  }

  /**
   * Clear typing indicator for a user in an escrow
   */
  clearTypingIndicator(escrowId, walletAddress) {
    const timeoutKey = `${escrowId}_${walletAddress}`;
    
    // Clear timeout if exists
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
      this.typingTimeouts.delete(timeoutKey);
    }
    
    // Remove from typing users
    if (this.typingUsers.has(escrowId)) {
      this.typingUsers.get(escrowId).delete(walletAddress);
      
      // Clean up empty sets
      if (this.typingUsers.get(escrowId).size === 0) {
        this.typingUsers.delete(escrowId);
      }
    }
    
    // Broadcast typing stopped
    this.io.to(`escrow_${escrowId}`).emit('user_typing', {
      escrowId,
      walletAddress,
      isTyping: false
    });
  }

  /**
   * Broadcast message to an escrow room
   */
  broadcastToEscrow(escrowId, event, data) {
    if (this.io) {
      this.io.to(`escrow_${escrowId}`).emit(event, data);
      console.log(`📡 Broadcast to escrow ${escrowId}: ${event}`);
    }
  }

  /**
   * Send notification to a specific user
   */
  notifyUser(walletAddress, notification) {
    if (this.io) {
      this.io.to(`user:${walletAddress}`).emit('notification', notification);
      console.log(`🔔 Notification sent to ${walletAddress.substring(0, 8)}...`);
    }
  }

  /**
   * Notify escrow update
   */
  notifyEscrowUpdate(escrowId, data) {
    this.broadcastToEscrow(escrowId, 'escrow:update', data);
  }

  /**
   * Notify verification progress
   */
  notifyVerificationProgress(escrowId, progress) {
    this.broadcastToEscrow(escrowId, 'verification:progress', progress);
  }

  /**
   * Notify user notification
   */
  notifyUserNotification(userAddress, notification) {
    this.notifyUser(userAddress, notification);
  }

  /**
   * Notify AI thinking status
   */
  notifyAIThinking(escrowId, agent, status) {
    this.broadcastToEscrow(escrowId, 'ai:thinking', { agent, status });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connections.size,
      activeEscrows: this.typingUsers.size,
      connections: Array.from(this.connections.values()).map(conn => ({
        walletAddress: conn.walletAddress.substring(0, 8) + '...',
        escrowRooms: Array.from(conn.escrowRooms),
        connectedAt: conn.connectedAt
      }))
    };
  }
}

export default new WebSocketService();