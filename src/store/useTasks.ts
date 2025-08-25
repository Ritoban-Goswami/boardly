// store/useTasks.ts
import { create } from 'zustand';
import { listenToTasks, addTask, updateTask, deleteTask } from '@/lib/firestore';

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  loading: true,

  initListener: () => {
    const unsub = listenToTasks((tasks: Task[]) => {
      set({ tasks, loading: false });
    });
    return unsub;
  },

  addTask: async (data: Omit<Task, 'id'>) => {
    await addTask(data);
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    await updateTask(id, updates);
  },

  deleteTask: async (id: string) => {
    await deleteTask(id);
  },
}));
