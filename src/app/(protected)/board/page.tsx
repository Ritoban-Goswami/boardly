'use client';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

  useEffect(() => {
    // Set presence
    if (auth.currentUser) {
      setUserOnline(
        auth.currentUser.uid,
        auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
      );
    }

    // Listen for presence
    const unsubPresence = initPresence();
    const unsubTyping = initTyping();

    // Handle page visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.hidden && auth.currentUser) {
        setUserOffline(auth.currentUser.uid);
      } else if (!document.hidden && auth.currentUser) {
        setUserOnline(
          auth.currentUser.uid,
          auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
        );
      }
    };

    // Handle beforeunload (page refresh, tab close)
    const handleBeforeUnload = () => {
      if (auth.currentUser) {
        setUserOffline(auth.currentUser.uid);
      }
    };

    // Handle network connectivity changes
    const handleOnline = () => {
      if (auth.currentUser) {
        setUserOnline(
          auth.currentUser.uid,
          auth.currentUser.displayName || auth.currentUser.email || 'Anonymous'
        );
      }
    };

    const handleOffline = () => {
      if (auth.currentUser) {
        setUserOffline(auth.currentUser.uid);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up presence when component unmounts
      if (auth.currentUser) {
        setUserOffline(auth.currentUser.uid);
      }

      unsubPresence();
      unsubTyping();

      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [initPresence, initTyping, setUserOnline, setUserOffline]); // cleanup was removed from dependencies

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
