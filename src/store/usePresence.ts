// store/usePresence.ts
import { create } from 'zustand';
import {
  listenToPresence,
  setUserPresence,
  setUserOffline,
  removeUserPresence,
  setTypingStatus,
} from '@/lib/realtime';

export const usePresenceStore = create<PresenceState>((set) => ({
  presence: {},
  initListener: () => {
    const unsub = listenToPresence((presence: Record<string, PresenceData>) => {
      set({ presence });
    });
    return unsub;
  },
  setUserOnline: (userId: string, displayName: string) => {
    setUserPresence(userId, displayName);
  },
  setUserOffline: (userId: string) => {
    setUserOffline(userId);
  },
  removeUserPresence: (userId: string) => {
    removeUserPresence(userId);
  },
  setTyping: (taskId: string, isTyping: boolean) => {
    setTypingStatus(taskId, isTyping);
  },
}));
