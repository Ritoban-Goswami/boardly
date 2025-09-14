// store/useNotifications.ts
import { create } from 'zustand';
import { listenToNotifications, markNotificationAsRead } from '@/lib/firestore';

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  loading: true,
  initListener: (userId: string) => {
    const unsub = listenToNotifications(userId, (notifications: AppNotification[]) => {
      set({ notifications, loading: false });
    });
    return unsub;
  },
  markAsRead: async (notificationId: string) => {
    try {
      // Optimistically update the UI
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        ),
      }));

      // Update in Firestore
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read: false } : notification
        ),
      }));
    }
  },
}));
