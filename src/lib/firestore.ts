// lib/firestore.ts
import { db } from './firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  arrayUnion,
} from 'firebase/firestore';
import type { User, Task, Board, AppNotification, ColumnId, Role } from '@/types';

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

// Create Notification
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  actorId?: string,
  boardId?: string
) => {
  const notificationsCol = collection(db, 'notifications');
  const docRef = await addDoc(notificationsCol, {
    userId,
    type,
    title,
    message,
    actorId,
    boardId,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Update notification read status
export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  return await updateDoc(notificationRef, {
    read: true,
    updatedAt: serverTimestamp(),
  });
};

// Accept Board Invitation
export const acceptBoardInvitation = async (
  notificationId: string,
  userId: string,
  boardId: string
) => {
  const boardRef = doc(db, 'boards', boardId);
  const notificationRef = doc(db, 'notifications', notificationId);
  const userRef = doc(db, 'users', userId);

  // Get notification data to find inviter
  const notificationSnap = await getDoc(notificationRef);
  const notificationData = notificationSnap.data();
  const inviterId = notificationData?.actorId;

  // Get user data to get display name
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const userDisplayName = userData?.displayName || 'A user';

  // Get current board data to add member with viewer role
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};

  // Add user to board members with viewer role
  await updateDoc(boardRef, {
    members: { ...currentMembers, [userId]: 'viewer' as Role },
    updatedAt: serverTimestamp(),
  });

  // Mark notification as read
  await markNotificationAsRead(notificationId);

  // Notify inviter that invitation was accepted
  if (inviterId) {
    const boardName = boardData?.name || 'a board';

    await createNotification(
      inviterId,
      'invitation_accepted',
      'Invitation accepted',
      `${userDisplayName} has accepted your invitation to join "${boardName}".`,
      userId,
      boardId
    );
  }
};

// Decline Board Invitation
export const declineBoardInvitation = async (notificationId: string, userId: string) => {
  const notificationRef = doc(db, 'notifications', notificationId);
  const userRef = doc(db, 'users', userId);

  // Get notification data to find inviter
  const notificationSnap = await getDoc(notificationRef);
  const notificationData = notificationSnap.data();
  const inviterId = notificationData?.actorId;
  const boardId = notificationData?.boardId;

  // Get user data to get display name
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const userDisplayName = userData?.displayName || 'A user';

  // Delete the notification
  await deleteDoc(notificationRef);

  // Notify inviter that invitation was declined
  if (inviterId && boardId) {
    const boardRef = doc(db, 'boards', boardId);
    const boardSnap = await getDoc(boardRef);
    const boardData = boardSnap.data();
    const boardName = boardData?.name || 'a board';

    await createNotification(
      inviterId,
      'invitation_declined',
      'Invitation declined',
      `${userDisplayName} has declined your invitation to join "${boardName}".`,
      userId,
      boardId
    );
  }
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

// Helper: Add member to board with specific role
export const addBoardMember = async (boardId: string, userId: string, role: Role) => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};

  // Check if user is already a member
  if (userId in currentMembers) {
    throw new Error('User is already a member of this board');
  }

  await updateDoc(boardRef, {
    members: { ...currentMembers, [userId]: role },
    updatedAt: serverTimestamp(),
  });
};

// Helper: Remove member from board
export const removeBoardMember = async (boardId: string, userId: string) => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};

  const { [userId]: removed, ...remainingMembers } = currentMembers;

  await updateDoc(boardRef, {
    members: remainingMembers,
    updatedAt: serverTimestamp(),
  });
};

// Helper: Update member role
export const updateBoardMemberRole = async (boardId: string, userId: string, newRole: Role) => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};

  if (!(userId in currentMembers)) {
    throw new Error('User is not a member of this board');
  }

  await updateDoc(boardRef, {
    members: { ...currentMembers, [userId]: newRole },
    updatedAt: serverTimestamp(),
  });
};

// Helper: Get user's role on a board
export const getUserBoardRole = async (boardId: string, userId: string): Promise<Role | null> => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const members = boardData?.members || {};

  return members[userId] || null;
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
  const q = query(boardsCol, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const allBoards = snapshot.docs.map((doc) => {
      const createdAt = parseTimestamp(doc.data()?.createdAt) || new Date();
      const updatedAt = parseTimestamp(doc.data()?.updatedAt) || new Date();
      return { id: doc.id, ...doc.data(), createdAt, updatedAt } as Board;
    });

    // Filter boards where user is owner or a member
    const userBoards = allBoards.filter(
      (board) => board.ownerId === userId || userId in board.members
    );

    callback(userBoards);
  });
};
