// store/useTasks.ts
import { create } from 'zustand';
import { listenToTasks, addTask, updateTask, deleteTask } from '@/lib/firestore';

export type ColumnId = 'todo' | 'in-progress' | 'done' | 'review';

export interface Task {
  id: string;
  title: string;
  status: ColumnId;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  labels?: string[];
  assignedTo?: string;
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  initListener: () => () => void;
  addTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

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
