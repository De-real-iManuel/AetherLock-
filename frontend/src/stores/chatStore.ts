import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Chat Store State
 * Manages unread message counts and chat-related state
 */
export interface ChatState {
  unreadCounts: Record<string, number>; // escrowId -> unread count
  totalUnread: number;
}

/**
 * Chat Store Actions
 */
interface ChatActions {
  setUnreadCount: (escrowId: string, count: number) => void;
  incrementUnread: (escrowId: string) => void;
  clearUnread: (escrowId: string) => void;
  clearAllUnread: () => void;
  getTotalUnread: () => number;
}

/**
 * Chat Store
 * Zustand store for managing chat state and unread message counts
 */
export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    (set, get) => ({
      // State
      unreadCounts: {},
      totalUnread: 0,

      // Actions
      setUnreadCount: (escrowId, count) =>
        set((state) => {
          const newUnreadCounts = { ...state.unreadCounts, [escrowId]: count };
          const totalUnread = Object.values(newUnreadCounts).reduce((sum, c) => sum + c, 0);
          return { unreadCounts: newUnreadCounts, totalUnread };
        }),

      incrementUnread: (escrowId) =>
        set((state) => {
          const currentCount = state.unreadCounts[escrowId] || 0;
          const newUnreadCounts = { ...state.unreadCounts, [escrowId]: currentCount + 1 };
          const totalUnread = Object.values(newUnreadCounts).reduce((sum, c) => sum + c, 0);
          return { unreadCounts: newUnreadCounts, totalUnread };
        }),

      clearUnread: (escrowId) =>
        set((state) => {
          const newUnreadCounts = { ...state.unreadCounts };
          delete newUnreadCounts[escrowId];
          const totalUnread = Object.values(newUnreadCounts).reduce((sum, c) => sum + c, 0);
          return { unreadCounts: newUnreadCounts, totalUnread };
        }),

      clearAllUnread: () =>
        set({ unreadCounts: {}, totalUnread: 0 }),

      getTotalUnread: () => get().totalUnread,
    }),
    { name: 'chat-store' }
  )
);
