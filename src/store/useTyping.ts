// store/useTyping.ts
import { create } from 'zustand';
import { listenToTyping, setTypingStatus } from '@/lib/realtime';

export const useTypingStore = create<TypingState>((set) => ({
  typing: {},
  initListener: () => {
    const unsub = listenToTyping((typing: TypingStateType) => {
      set({ typing });
    });
    return unsub;
  },
  setTyping: (taskId: string, isTyping: boolean) => {
    setTypingStatus(taskId, isTyping);
  },
}));
