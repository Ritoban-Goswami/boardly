// store/usePresence.ts
import { create } from "zustand";
import { listenToPresence, setUserPresence } from "@/lib/realtime";

export const usePresenceStore = create((set) => ({
  presence: {},
  initListener: () => {
    const unsub = listenToPresence((presence) => {
      set({ presence });
    });
    return unsub;
  },
  setUserOnline: (userId, displayName) => {
    setUserPresence(userId, displayName);
  },
}));
