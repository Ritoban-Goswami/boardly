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

// Get Notifications (Real-time listener)
export const listenToNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
) => {
  const notificationsCol = collection(db, 'notifications');
  const q = query(notificationsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => {
      const createdAt =
        doc.data()?.createdAt?.toDate?.() ??
        (doc.data()?.createdAt?.seconds
          ? new Date(doc.data().createdAt.seconds * 1000)
          : (doc.data()?.createdAt ?? null));
      return { id: doc.id, ...doc.data(), createdAt } as AppNotification;
    });
    callback(notifications);
  });
};
