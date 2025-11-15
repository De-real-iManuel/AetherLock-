import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto remove after duration
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, duration);
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),

  clearAll: () => set({ notifications: [] })
}));

export const useNotification = () => {
  const { addNotification } = useNotificationStore();

  return {
    success: (title: string, message: string) =>
      addNotification({ type: 'success', title, message }),
    
    error: (title: string, message: string) =>
      addNotification({ type: 'error', title, message }),
    
    info: (title: string, message: string) =>
      addNotification({ type: 'info', title, message }),
    
    warning: (title: string, message: string) =>
      addNotification({ type: 'warning', title, message })
  };
};