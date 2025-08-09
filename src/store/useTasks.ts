// store/useTasks.ts
import { create } from "zustand";
import {
  listenToTasks,
  addTask,
  updateTask,
  deleteTask,
} from "@/lib/firestore";

export const useTasksStore = create((set, get) => ({
  tasks: [],
  loading: true,

  initListener: () => {
    const unsub = listenToTasks((tasks) => {
      set({ tasks, loading: false });
    });
    return unsub;
  },

  addTask: async (data) => {
    await addTask(data);
  },

  updateTask: async (id, updates) => {
    await updateTask(id, updates);
  },

  deleteTask: async (id) => {
    await deleteTask(id);
  },
}));
