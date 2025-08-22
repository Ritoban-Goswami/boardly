// lib/firestore.ts
import { db } from './firebase';
import { Task, ColumnId } from '@/store/useTasks';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

// COLLECTION REFERENCE
const tasksCol = collection(db, 'tasks');

// Create Task
export const addTask = async (values: Omit<Task, 'id'>) => {
  return await addDoc(tasksCol, {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Task
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
  const taskRef = doc(db, 'tasks', taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete Task
export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  return await deleteDoc(taskRef);
};

// Get Tasks (Real-time listener)
export const listenToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(tasksCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: '',
      status: 'todo' as ColumnId,
      priority: 'medium' as const,
      order: 0,
      ...doc.data(),
    }));
    callback(tasks);
  });
};
