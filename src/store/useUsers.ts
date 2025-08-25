// store/useUsers.ts
import { create } from 'zustand';
import { listenToUsers } from '@/lib/firestore';

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
