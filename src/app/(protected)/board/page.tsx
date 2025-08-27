'use client';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import KanbanBoard from '@/components/KanbanBoard';
import Navbar from '@/components/Navbar';
import { usePresenceStore } from '@/store/usePresence';
import { useTypingStore } from '@/store/useTyping';

export default function Home() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { initListener: initPresence, setUserOnline, setUserOffline } = usePresenceStore();
  const { initListener: initTyping } = useTypingStore();

  // Presence management functions
  const setUserPresence = useCallback(
    (online: boolean) => {
      if (!auth.currentUser) return;

      const userId = auth.currentUser.uid;
      const displayName = auth.currentUser.displayName || auth.currentUser.email || 'Anonymous';

      if (online) {
        setUserOnline(userId, displayName);
      } else {
        setUserOffline(userId);
      }
    },
    [setUserOnline, setUserOffline]
  );

  // Event handlers
  const handleVisibilityChange = useCallback(() => {
    setUserPresence(!document.hidden);
  }, [setUserPresence]);

  const handleBeforeUnload = useCallback(() => {
    setUserPresence(false);
  }, [setUserPresence]);

  const handleNetworkChange = useCallback(
    (isOnline: boolean) => {
      setUserPresence(isOnline);
    },
    [setUserPresence]
  );

  useEffect(() => {
    // Initialize presence
    setUserPresence(true);

    // Set up listeners
    const unsubPresence = initPresence();
    const unsubTyping = initTyping();

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', () => handleNetworkChange(true));
    window.addEventListener('offline', () => handleNetworkChange(false));

    // Cleanup function
    return () => {
      setUserPresence(false);
      unsubPresence();
      unsubTyping();

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', () => handleNetworkChange(true));
      window.removeEventListener('offline', () => handleNetworkChange(false));
    };
  }, [
    initPresence,
    initTyping,
    setUserPresence,
    handleVisibilityChange,
    handleBeforeUnload,
    handleNetworkChange,
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="container mx-auto px-0 lg:px-4 pb-8 pt-4">
        <KanbanBoard />
      </main>
    </div>
  );
}
