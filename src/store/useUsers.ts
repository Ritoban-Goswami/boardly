// store/useUsers.ts
import { create } from 'zustand';
import { listenToUsers } from '@/lib/firestore';
import type { UsersState, User } from '@/types';

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: true,
  initListener: () => {
    const unsub = listenToUsers((users: User[]) => {
      set({ users, loading: false });
    });
    return unsub;
  },
}));
