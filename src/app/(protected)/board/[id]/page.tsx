'use client';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import { usePresenceStore } from '@/store/usePresence';
import { useTasksStore } from '@/store/useTasks';
import { useBoards } from '@/store/useBoards';

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const [user, loading] = useAuthState(auth);
  const { initListener: initPresence, setUserOnline, setUserOffline } = usePresenceStore();
  const setBoardId = useTasksStore((state) => state.setBoardId);
  const { boards, loading: boardsLoading } = useBoards();

  // Get board ID from URL
  const boardId = params.id as string;

  // Check if board ID exists in user's boards
  const currentBoard = boards.find((board) => board.id === boardId);
  const boardExists = !!currentBoard;

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

    // Store references for cleanup
    const handleOnline = () => handleNetworkChange(true);
    const handleOffline = () => handleNetworkChange(false);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      setUserPresence(false);
      unsubPresence();

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [
    initPresence,
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

  // Set board ID for tasks when board exists
  useEffect(() => {
    if (boardExists && boardId) {
      setBoardId(boardId);
    }
  }, [boardExists, boardId, setBoardId]);

  // Redirect to home when the current board no longer exists (deleted or inaccessible)
  useEffect(() => {
    if (!boardsLoading && !boardExists) {
      router.replace('/');
    }
  }, [boardsLoading, boardExists, router]);

  // Show loading state while boards are loading
  if (boardsLoading) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading board...</p>
        </div>
      </main>
    );
  }

  // Board doesn't exist — redirecting to home
  if (!boardExists) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Redirecting...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-0 lg:px-4 pb-8 pt-4">
        <KanbanBoard
          boardId={currentBoard.id}
          boardName={currentBoard.name}
          members={currentBoard.members}
          ownerId={currentBoard.ownerId}
        />
      </div>
    </main>
  );
}
