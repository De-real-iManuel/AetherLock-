import { io, Socket } from 'socket.io-client';

// WebSocket Configuration
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

// Message types
export interface ChatMessage {
  id: string;
  escrowId: string;
  senderId: string;
  senderRole: 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  read: boolean;
}

// Event types
export type WebSocketEvent = 
  | 'chat:message'
  | 'chat:typing'
  | 'chat:read'
  | 'escrow:update'
  | 'notification'
  | 'ai:verification'
  | 'dispute:update';

// Event callback type
export type EventCallback<T = any> = (data: T) => void;

// WebSocket error class
export class WebSocketError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'WebSocketError';
  }
}

/**
 * WebSocket Service for real-time communication
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting = false;
  private userAddress: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(walletAddress?: string): void {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('[WebSocket] Connection in progress');
      return;
    }

    this.isConnecting = true;
    this.userAddress = walletAddress || null;

    console.log('[WebSocket] Connecting to', WS_URL);

    this.socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.maxReconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
      auth: {
        walletAddress: this.userAddress,
      },
    });

    this.setupEventHandlers();
    this.isConnecting = false;
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('[WebSocket] Disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('[WebSocket] Connection error:', error.message);
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber: any) => {
      console.log(`[WebSocket] Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber: any) => {
      console.log(`[WebSocket] Reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('[WebSocket] Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Reconnection failed after maximum attempts');
    });

    // Chat events
    this.socket.on('chat_message', (data: ChatMessage) => {
      this.emit('chat:message', data);
    });

    this.socket.on('user_typing', (data: { escrowId: string; walletAddress: string; isTyping: boolean }) => {
      this.emit('chat:typing', data);
    });

    this.socket.on('message_read', (data: { escrowId: string; messageId: string }) => {
      this.emit('chat:read', data);
    });

    // User presence events
    this.socket.on('user_joined', (data: { walletAddress: string; timestamp: Date }) => {
      console.log('[WebSocket] User joined:', data.walletAddress);
    });

    this.socket.on('user_left', (data: { walletAddress: string; timestamp: Date }) => {
      console.log('[WebSocket] User left:', data.walletAddress);
    });

    // Escrow events
    this.socket.on('escrow:update', (data: any) => {
      this.emit('escrow:update', data);
    });

    // Notification events
    this.socket.on('notification', (data: any) => {
      this.emit('notification', data);
    });

    // AI verification events
    this.socket.on('ai:verification', (data: any) => {
      this.emit('ai:verification', data);
    });

    // Dispute events
    this.socket.on('dispute:update', (data: any) => {
      this.emit('dispute:update', data);
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Maximum reconnection attempts reached');
      return;
    }

    // Exponential backoff
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      this.maxReconnectDelay
    );

    console.log(`[WebSocket] Will retry in ${this.reconnectDelay}ms`);
  }

  /**
   * Manually reconnect
   */
  private reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.userAddress = null;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join escrow room for chat
   */
  joinEscrowRoom(escrowId: string): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot join room - not connected');
      return;
    }

    this.socket.emit('subscribe_escrow', escrowId);
    console.log('[WebSocket] Joined escrow room:', escrowId);
  }

  /**
   * Leave escrow room
   */
  leaveEscrowRoom(escrowId: string): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot leave room - not connected');
      return;
    }

    this.socket.emit('unsubscribe_escrow', escrowId);
    console.log('[WebSocket] Left escrow room:', escrowId);
  }

  /**
   * Send chat message
   */
  sendMessage(escrowId: string, content: string): void {
    if (!this.socket?.connected) {
      throw new WebSocketError('Cannot send message - not connected', 'NOT_CONNECTED');
    }

    if (!content.trim()) {
      throw new WebSocketError('Message content cannot be empty', 'EMPTY_MESSAGE');
    }

    this.socket.emit('chat_message', {
      escrowId,
      content: content.trim(),
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(escrowId: string, isTyping: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    const event = isTyping ? 'typing_start' : 'typing_stop';
    this.socket.emit(event, { escrowId });
  }

  /**
   * Mark message as read
   */
  markMessageRead(escrowId: string, messageId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('message_read', {
      escrowId,
      messageId,
    });
  }

  /**
   * Add event listener
   */
  on<T = any>(event: WebSocketEvent, callback: EventCallback<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(callback);
  }

  /**
   * Remove event listener
   */
  off<T = any>(event: WebSocketEvent, callback: EventCallback<T>): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Remove all event listeners for an event
   */
  removeAllListeners(event?: WebSocketEvent): void {
    if (event) {
      this.eventListeners.delete(event);
    } else {
      this.eventListeners.clear();
    }
  }

  /**
   * Emit event to listeners
   */
  private emit<T = any>(event: string, data: T): void {
    const listeners = this.eventListeners.get(event as WebSocketEvent);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    userAddress: string | null;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      userAddress: this.userAddress,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export class for testing
export { WebSocketService };

// Export default
export default websocketService;
