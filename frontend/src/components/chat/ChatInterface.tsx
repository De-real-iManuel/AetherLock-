import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../../types/models';
import { websocketService } from '../../services/websocket';
import { api } from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';

interface ChatInterfaceProps {
  escrowId: string;
  currentUserId: string;
  currentUserRole: 'client' | 'freelancer';
  onClose?: () => void;
}

/**
 * ChatInterface Component
 * Real-time chat interface with message history and WebSocket connection
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  escrowId,
  currentUserId,
  currentUserRole,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const user = useUserStore((state) => state.user);
  const { clearUnread, incrementUnread } = useChatStore();

  // Auto-scroll to latest message
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  // Load message history on mount
  useEffect(() => {
    const loadMessageHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch message history from API
        const response = await api.get<{ messages: Message[] }>(
          `/api/chat/${escrowId}/history`
        );
        
        setMessages(response.messages || []);
        
        // Scroll to bottom after loading messages
        setTimeout(() => scrollToBottom(false), 100);
      } catch (err: any) {
        console.error('[ChatInterface] Failed to load message history:', err);
        setError('Failed to load message history');
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessageHistory();
  }, [escrowId]);

  // Establish WebSocket connection
  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!websocketService.isConnected()) {
      websocketService.connect(currentUserId);
    }

    // Join escrow room
    websocketService.joinEscrowRoom(escrowId);
    setIsConnected(websocketService.isConnected());

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.escrowId === escrowId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        // Auto-scroll to new message
        setTimeout(() => scrollToBottom(), 100);

        // Mark message as read if it's from the other user
        if (message.senderId !== currentUserId) {
          websocketService.markMessageRead(escrowId, message.id);
        } else {
          // If it's from another user and chat is not open, increment unread
          // (This handles messages received when chat is closed)
          incrementUnread(escrowId);
        }
      }
    };

    // Listen for typing indicators
    const handleTyping = (data: { escrowId: string; userId: string; isTyping: boolean }) => {
      if (data.escrowId === escrowId && data.userId !== currentUserId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    // Listen for read receipts
    const handleRead = (data: { escrowId: string; messageId: string }) => {
      if (data.escrowId === escrowId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, read: true } : msg
          )
        );
      }
    };

    websocketService.on('chat:message', handleNewMessage);
    websocketService.on('chat:typing', handleTyping);
    websocketService.on('chat:read', handleRead);

    // Cleanup
    return () => {
      websocketService.off('chat:message', handleNewMessage);
      websocketService.off('chat:typing', handleTyping);
      websocketService.off('chat:read', handleRead);
      websocketService.leaveEscrowRoom(escrowId);
    };
  }, [escrowId, currentUserId, incrementUnread]);

  // Clear unread count when chat is opened
  useEffect(() => {
    clearUnread(escrowId);
  }, [escrowId, clearUnread]);

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    try {
      websocketService.sendMessage(escrowId, content);
      
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        escrowId,
        senderId: currentUserId,
        senderRole: currentUserRole,
        content,
        timestamp: new Date(),
        read: false,
      };
      
      setMessages((prev) => [...prev, optimisticMessage]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err: any) {
      console.error('[ChatInterface] Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    websocketService.sendTyping(escrowId, isTyping);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {currentUserRole === 'client' ? 'F' : 'C'}
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {currentUserRole === 'client' ? 'Freelancer' : 'Client'}
            </h3>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-gray-500'
                }`}
              />
              <span className="text-xs text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-400">No messages yet</p>
              <p className="text-gray-500 text-sm mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUserId}
                  showAvatar={true}
                  showTimestamp={true}
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {otherUserTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 mb-4"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {currentUserRole === 'client' ? 'F' : 'C'}
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={!isConnected}
        placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
      />
    </div>
  );
};

export default ChatInterface;
