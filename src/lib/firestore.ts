// lib/firestore.ts
import { db } from "./firebase";
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
} from "firebase/firestore";

// COLLECTION REFERENCE
const tasksCol = collection(db, "tasks");

// Create Task
export const addTask = async (values) => {
  return await addDoc(tasksCol, {
    ...values,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Update Task
export const updateTask = async (taskId, updates) => {
  const taskRef = doc(db, "tasks", taskId);
  return await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete Task
export const deleteTask = async (taskId) => {
  const taskRef = doc(db, "tasks", taskId);
  return await deleteDoc(taskRef);
};

// Get Tasks (Real-time listener)
export const listenToTasks = (callback) => {
  const q = query(tasksCol, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};
