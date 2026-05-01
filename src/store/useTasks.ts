// store/useTasks.ts
import { create } from 'zustand';
import { listenToTasks, addTask, updateTask, deleteTask } from '@/lib/firestore';
import type { TasksState, Task } from '@/types';

interface TasksStateWithBoard extends TasksState {
  boardId: string | null;
  setBoardId: (boardId: string | null) => void;
  _tasksUnsubscribe: (() => void) | null;
}

export const useTasksStore = create<TasksStateWithBoard>((set, get) => ({
  tasks: [],
  loading: true,
  boardId: null,
  _tasksUnsubscribe: null,

  setBoardId: (boardId: string | null) => {
    const currentBoardId = get().boardId;
    const currentUnsub = get()._tasksUnsubscribe;

    // Clean up existing listener
    if (currentUnsub) {
      currentUnsub();
    }

    if (currentBoardId === boardId) return;

    set({ boardId, loading: true, tasks: [], _tasksUnsubscribe: null });

    if (boardId) {
      const unsub = listenToTasks(boardId, (tasks: Task[]) => {
        set({ tasks, loading: false });
      });
      set({ _tasksUnsubscribe: unsub });
    } else {
      set({ loading: false });
    }
  },

  addTask: async (data: Omit<Task, 'id'>) => {
    const { boardId } = get();
    if (!boardId) throw new Error('No board selected');
    const taskId = await addTask(boardId, data);
    return taskId;
  },

  updateTask: async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    const { boardId } = get();
    if (!boardId) throw new Error('No board selected');
    await updateTask(boardId, id, updates);
  },

  deleteTask: async (id: string) => {
    const { boardId } = get();
    if (!boardId) throw new Error('No board selected');
    await deleteTask(boardId, id);
  },
}));
