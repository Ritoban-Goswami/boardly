// lib/realtime.ts
import { ref, onValue, set, onDisconnect } from "firebase/database";
import { auth, rtdb } from "./firebase";

// Presence
export const setUserPresence = (userId: string, displayName: string) => {
  const userRef = ref(rtdb, `presence/${userId}`);
  const presenceData = {
    displayName,
    online: true,
    lastSeen: Date.now(),
  };

  // Set as online
  set(userRef, presenceData);

  // Auto set offline on disconnect
  onDisconnect(userRef).set({
    displayName,
    online: false,
    lastSeen: Date.now(),
  });
};

export const listenToPresence = (
  callback: (presence: Record<string, any>) => void
) => {
  const presenceRef = ref(rtdb, "presence");
  return onValue(presenceRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};

// Typing
export const setTypingStatus = (taskId: string, isTyping: boolean) => {
  if (!auth.currentUser) return;
  const userId = auth.currentUser.uid;
  const typingRef = ref(rtdb, `typing/${taskId}/${userId}`);
  set(typingRef, isTyping);
};

export const listenToTyping = (
  callback: (typingUsers: Record<string, boolean>) => void
) => {
  const typingRef = ref(rtdb, `typing`);
  return onValue(typingRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
};
