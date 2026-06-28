import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
  route?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (noti: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: 'welcome',
      title: '👋 Chào mừng bạn',
      message: 'Chào mừng bạn đến với hệ thống quản lý thiết bị NeoBoard!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'info',
      route: '/'
    }
  ],
  addNotification: (noti) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNoti: AppNotification = {
      ...noti,
      id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    set((state) => ({ notifications: [newNoti, ...state.notifications].slice(0, 20) })); // Keep last 20
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }));
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    }));
  },
  clearAll: () => {
    set({ notifications: [] });
  }
}));
