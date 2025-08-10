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
  const { initListener: initPresence, setUserOnline } = usePresenceStore();
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

    return () => {
      unsubPresence();
      unsubTyping();
    };
  }, [initPresence, initTyping, setUserOnline]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pb-8 pt-4">
        <KanbanBoard />
      </main>
    </div>
  );
}
