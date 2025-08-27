// lib/realtime.ts
import { ref, onValue, remove, update } from 'firebase/database';
import { auth, rtdb } from './firebase';

// Presence
export const setUserPresence = (userId: string, displayName: string) => {
  const userRef = ref(rtdb, `presence/${userId}`);
  const presenceData: PresenceData = {
    displayName,
    online: true,
    lastSeen: Date.now(),
  };

  // Set as online
  update(userRef, presenceData);
};

// Clean up presence when user explicitly goes offline
export const setUserOffline = (userId: string) => {
  const userRef = ref(rtdb, `presence/${userId}`);

  // Set offline status
  update(userRef, {
    displayName: auth.currentUser?.displayName || auth.currentUser?.email || 'Anonymous',
    online: false,
    lastSeen: Date.now(),
  });
};

// Remove user presence completely (e.g., on logout)
export const removeUserPresence = (userId: string) => {
  const userRef = ref(rtdb, `presence/${userId}`);

  // Remove the presence entry
  remove(userRef);
};

export const listenToPresence = (callback: (presence: Record<string, PresenceData>) => void) => {
  const presenceRef = ref(rtdb, 'presence');
  return onValue(presenceRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

// Typing
export const setTypingStatus = (taskId: string, isTyping: boolean) => {
  if (!auth.currentUser) return;

  const userId = auth.currentUser.uid;
  const userRef = ref(rtdb, `presence/${userId}`);

  isTyping
    ? update(userRef, { currentTaskViewing: taskId })
    : remove(ref(rtdb, `presence/${userId}/currentTaskViewing`));
};
