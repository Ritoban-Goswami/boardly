// store/usePresence.ts
import { create } from 'zustand';
import { listenToPresence, setUserPresence } from '@/lib/realtime';

interface PresenceData {
  displayName: string;
  online: boolean;
  lastSeen: number;
}

interface PresenceState {
  presence: Record<string, PresenceData>;
  initListener: () => () => void;
  setUserOnline: (userId: string, displayName: string) => void;
}

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
}));
