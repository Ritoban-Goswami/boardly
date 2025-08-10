// store/useTyping.ts
import { create } from "zustand";
import { listenToTyping, setTypingStatus } from "@/lib/realtime";

export const useTypingStore = create((set) => ({
  typing: {},

  initListener: (taskId) => {
    const unsub = listenToTyping(taskId, (typing) => {
      set({ typing });
    });
    return unsub;
  },

  setTyping: (taskId, isTyping) => {
    setTypingStatus(taskId, isTyping);
  },
}));
