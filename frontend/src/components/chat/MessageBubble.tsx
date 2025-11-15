import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../../types/models';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

/**
 * MessageBubble Component
 * Displays a chat message with sender-based styling
 * Own messages: right-aligned with cyan gradient
 * Other messages: left-aligned with purple gradient
 * 
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
}) => {
  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 mb-4 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isOwnMessage
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}
        >
          {message.senderRole === 'client' ? 'C' : 'F'}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-br-none'
              : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-bl-none'
          }`}
        >
          {/* Glow Effect */}
          <div
            className={`absolute inset-0 rounded-2xl blur-sm -z-10 ${
              isOwnMessage
                ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-br-none'
                : 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-none'
            }`}
          />

          {/* Message Text */}
          <p className="text-white text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Unread Indicator */}
          {!message.read && !isOwnMessage && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"
            />
          )}
        </div>

        {/* Timestamp and Read Status */}
        {showTimestamp && (
          <div className="flex items-center gap-2 mt-1 px-2">
            <span className="text-xs text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
            {isOwnMessage && (
              <span className="text-xs">
                {message.read ? (
                  <span className="text-cyan-400">✓✓</span>
                ) : (
                  <span className="text-gray-500">✓</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Memoize component to prevent re-renders when props haven't changed
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.read === nextProps.message.read &&
    prevProps.isOwnMessage === nextProps.isOwnMessage &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showTimestamp === nextProps.showTimestamp
  );
});

export default MessageBubble;
