import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  timestamp: Date
}

interface NotificationState {
  notifications: Notification[]
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools(
    (set) => ({
      // State
      notifications: [],

      // Actions
      addNotification: (notification) => {
        const id = crypto.randomUUID()
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date()
        }
        
        set(state => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            set(state => ({
              notifications: state.notifications.filter(n => n.id !== id)
            }))
          }, notification.duration || 5000)
        }
      },

      removeNotification: (id) =>
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      clearAll: () => set({ notifications: [] })
    }),
    { name: 'notification-store' }
  )
)