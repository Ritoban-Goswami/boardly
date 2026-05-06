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
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: '',
        status: 'todo' as ColumnId,
        priority: 'medium' as const,
        order: 0,
        ...doc.data(),
      }));
      callback(tasks);
    },
    (error) => {
      console.error(`[Firestore] Failed to listen to tasks for board "${boardId}":`, error);
    }
  );
};

// Get Users (Real-time listener)
export const listenToUsers = (callback: (users: User[]) => void) => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        uid: doc.id,
        email: '',
        displayName: '',
        ...doc.data(),
      }));
      callback(users);
    },
    (error) => {
      console.error('[Firestore] Failed to listen to users collection:', error);
    }
  );
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

  // Get notification data
  const notificationSnap = await getDoc(notificationRef);
  if (!notificationSnap.exists()) {
    throw new Error('Notification not found');
  }
  const notificationData = notificationSnap.data();

  // Verify notification belongs to user
  if (notificationData?.userId !== userId) {
    throw new Error('Notification does not belong to this user');
  }

  // Verify notification type is board_invitation
  if (notificationData?.type !== 'board_invitation') {
    throw new Error('This is not a board invitation notification');
  }

  // Verify boardId matches
  if (notificationData?.boardId !== boardId) {
    throw new Error('Board ID does not match the invitation');
  }

  const inviterId = notificationData?.actorId;

  // Get user data to get display name
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();
  const userDisplayName = userData?.displayName || 'A user';

  // Get current board data
  const boardSnap = await getDoc(boardRef);
  if (!boardSnap.exists()) {
    throw new Error('Board not found');
  }
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};
  const currentMemberIds = boardData?.memberIds || [];

  // Check if user is already a member
  if (userId in currentMembers) {
    throw new Error('User is already a member of this board');
  }

  // Add user to board members with viewer role
  await updateDoc(boardRef, {
    members: { ...currentMembers, [userId]: 'viewer' as Role },
    memberIds: [...currentMemberIds, userId],
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
  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => {
        const createdAt = parseTimestamp(doc.data()?.createdAt);
        return { id: doc.id, ...doc.data(), createdAt } as AppNotification;
      });
      callback(notifications);
    },
    (error) => {
      console.error(`[Firestore] Failed to listen to notifications for user "${userId}":`, error);
    }
  );
};

// BOARD OPERATIONS

// Create Board
export const addBoard = async (values: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => {
  const memberIds = Object.keys(values.members);

  // Filter out undefined values
  const filteredValues = Object.entries(values).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );

  const docRef = await addDoc(boardsCol, {
    ...filteredValues,
    memberIds,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Helper: Remove member from board
export const removeBoardMember = async (boardId: string, userId: string) => {
  const boardRef = doc(db, 'boards', boardId);
  const boardSnap = await getDoc(boardRef);
  const boardData = boardSnap.data();
  const currentMembers = boardData?.members || {};
  const currentMemberIds = boardData?.memberIds || [];

  const { [userId]: _removed, ...remainingMembers } = currentMembers;
  const remainingMemberIds = currentMemberIds.filter((id: string) => id !== userId);

  await updateDoc(boardRef, {
    members: remainingMembers,
    memberIds: remainingMemberIds,
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

// Update Board
export const updateBoard = async (
  boardId: string,
  updates: Partial<Omit<Board, 'id'>>,
  userId: string
) => {
  const boardRef = doc(db, 'boards', boardId);

  // Get board data for validation
  const boardSnap = await getDoc(boardRef);
  if (!boardSnap.exists()) {
    throw new Error('Board not found');
  }
  const boardData = boardSnap.data();

  // Client-side validation: Check if user is owner or admin
  const userRole = boardData?.members?.[userId];
  if (boardData?.ownerId !== userId && userRole !== 'admin') {
    throw new Error('User does not have permission to update this board');
  }

  // Filter out undefined values
  const filteredUpdates = Object.entries(updates).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );

  return await updateDoc(boardRef, {
    ...filteredUpdates,
    updatedAt: serverTimestamp(),
  });
};

// Delete Board
export const deleteBoard = async (boardId: string) => {
  const boardRef = doc(db, 'boards', boardId);
  return await deleteDoc(boardRef);
};

// Listen to user's boards (either as owner or member)
export const listenToUserBoards = (userId: string, callback: (boards: Board[]) => void) => {
  // Query boards where user is owner
  const ownerQuery = query(boardsCol, where('ownerId', '==', userId), orderBy('createdAt', 'desc'));

  // Query boards where user is in memberIds array
  const memberQuery = query(
    boardsCol,
    where('memberIds', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );

  let ownerBoards: Board[] = [];
  let memberBoards: Board[] = [];
  let ownerLoaded = false;
  let memberLoaded = false;

  const unsubscribeOwner = onSnapshot(
    ownerQuery,
    (snapshot) => {
      ownerBoards = snapshot.docs.map((doc) => {
        const createdAt = parseTimestamp(doc.data()?.createdAt) || new Date();
        const updatedAt = parseTimestamp(doc.data()?.updatedAt) || new Date();
        return { id: doc.id, ...doc.data(), createdAt, updatedAt } as Board;
      });
      ownerLoaded = true;

      if (ownerLoaded && memberLoaded) {
        // Merge and deduplicate boards
        const boardMap = new Map<string, Board>();
        [...ownerBoards, ...memberBoards].forEach((board) => {
          boardMap.set(board.id, board);
        });

        // Client-side validation: Filter boards to ensure user is owner or in memberIds
        const filteredBoards = Array.from(boardMap.values()).filter(
          (board) => board.ownerId === userId || board.memberIds?.includes(userId)
        );

        callback(
          filteredBoards.sort(
            (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
          )
        );
      }
    },
    (error) => {
      console.error(`[Firestore] Failed to listen to owned boards for user "${userId}":`, error);
    }
  );

  const unsubscribeMember = onSnapshot(
    memberQuery,
    (snapshot) => {
      memberBoards = snapshot.docs.map((doc) => {
        const createdAt = parseTimestamp(doc.data()?.createdAt) || new Date();
        const updatedAt = parseTimestamp(doc.data()?.updatedAt) || new Date();
        return { id: doc.id, ...doc.data(), createdAt, updatedAt } as Board;
      });
      memberLoaded = true;

      if (ownerLoaded && memberLoaded) {
        // Merge and deduplicate boards
        const boardMap = new Map<string, Board>();
        [...ownerBoards, ...memberBoards].forEach((board) => {
          boardMap.set(board.id, board);
        });

        // Client-side validation: Filter boards to ensure user is owner or in memberIds
        const filteredBoards = Array.from(boardMap.values()).filter(
          (board) => board.ownerId === userId || board.memberIds?.includes(userId)
        );

        callback(
          filteredBoards.sort(
            (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
          )
        );
      }
    },
    (error) => {
      console.error(`[Firestore] Failed to listen to member boards for user "${userId}":`, error);
    }
  );

  // Return combined unsubscribe function
  return () => {
    unsubscribeOwner();
    unsubscribeMember();
  };
};
