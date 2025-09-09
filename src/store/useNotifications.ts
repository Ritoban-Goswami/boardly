// store/useNotifications.ts
import { create } from 'zustand';
import { listenToNotifications } from '@/lib/firestore';

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  loading: true,
  initListener: (userId: string) => {
    const unsub = listenToNotifications(userId, (notifications: AppNotification[]) => {
      set({ notifications, loading: false });
    });
    return unsub;
  },
}));
