// lib/firestore.ts
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { User, Task, Board, AppNotification, ColumnId } from '@/types';

// COLLECTION REFERENCE
const boardsCol = collection(db, 'boards');

// Helper function to parse Firestore timestamps to Date
const parseTimestamp = (
  timestamp: { toDate?: () => Date; seconds?: number } | null | undefined
): Date | null => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return null;
};

// Create Task (board-scoped)
export const addTask = async (boardId: string, values: Omit<Task, 'id'>) => {
  const boardTasksCol = collection(db, 'boards', boardId, 'tasks');
  const docRef = await addDoc(boardTasksCol, {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update Task (board-scoped)
export const updateTask = async (
  boardId: string,
  taskId: string,
  updates: Partial<Omit<Task, 'id'>>
) => {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete Task (board-scoped)
export const deleteTask = async (boardId: string, taskId: string) => {
  const taskRef = doc(db, 'boards', boardId, 'tasks', taskId);
  return await deleteDoc(taskRef);
};

// Get Tasks (Real-time listener, board-scoped)
export const listenToTasks = (boardId: string, callback: (tasks: Task[]) => void) => {
  const boardTasksCol = collection(db, 'boards', boardId, 'tasks');
  const q = query(boardTasksCol, orderBy('order', 'asc'));
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

// Get Users (Real-time listener)
export const listenToUsers = (callback: (users: User[]) => void) => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      uid: doc.id,
      email: '',
      displayName: '',
      ...doc.data(),
    }));
    callback(users);
  });
};

// Create or Update User
export const createUserInFirestore = async (user: User) => {
  if (!user.uid || !user.email) return;

  const userRef = doc(db, 'users', user.uid);

  await setDoc(
    userRef,
    {
      email: user.email,
      displayName: user.displayName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Update notification read status
export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  return await updateDoc(notificationRef, {
    read: true,
    updatedAt: serverTimestamp(),
  });
};

// Get Notifications (Real-time listener)
export const listenToNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
) => {
  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => {
      const createdAt = parseTimestamp(doc.data()?.createdAt);
      return { id: doc.id, ...doc.data(), createdAt } as AppNotification;
    });
    callback(notifications);
  });
};

// BOARD OPERATIONS

// Create Board
export const addBoard = async (values: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(boardsCol, {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update Board
export const updateBoard = async (boardId: string, updates: Partial<Omit<Board, 'id'>>) => {
  const boardRef = doc(db, 'boards', boardId);
  return await updateDoc(boardRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete Board
export const deleteBoard = async (boardId: string) => {
  const boardRef = doc(db, 'boards', boardId);
  return await deleteDoc(boardRef);
};

// Get Boards (Real-time listener)
export const listenToBoards = (callback: (boards: Board[]) => void) => {
  const q = query(boardsCol, orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map((doc) => {
      const createdAt = parseTimestamp(doc.data()?.createdAt);
      const updatedAt = parseTimestamp(doc.data()?.updatedAt);
      return { id: doc.id, ...doc.data(), createdAt, updatedAt } as Board;
    });
    callback(boards);
  });
};

// Listen to user's boards (either as owner or member)
export const listenToUserBoards = (userId: string, callback: (boards: Board[]) => void) => {
  const q = query(
    boardsCol,
    where('members', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const boards = snapshot.docs.map((doc) => {
      const createdAt = parseTimestamp(doc.data()?.createdAt) || new Date();
      const updatedAt = parseTimestamp(doc.data()?.updatedAt) || new Date();
      return { id: doc.id, ...doc.data(), createdAt, updatedAt } as Board;
    });
    callback(boards);
  });
};
