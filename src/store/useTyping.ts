// store/useTyping.ts
import { create } from 'zustand';
import { listenToTyping, setTypingStatus } from '@/lib/realtime';

// Structure: { [taskId: string]: { [userId: string]: boolean } }
type TypingStateType = Record<string, Record<string, boolean>>;

interface TypingState {
  typing: TypingStateType;
  initListener: () => () => void;
  setTyping: (taskId: string, isTyping: boolean) => void;
}

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
