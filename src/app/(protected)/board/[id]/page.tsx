'use client';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/KanbanBoard';
import { usePresenceStore } from '@/store/usePresence';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

// Mock board data - should match BoardSwitcher data
const mockBoards = [
  { id: '1', name: 'Marketing Campaign', color: 'bg-blue-500', memberCount: 5 },
  { id: '2', name: 'Product Roadmap', color: 'bg-purple-500', memberCount: 8 },
  { id: '3', name: 'Design System', color: 'bg-pink-500', memberCount: 3 },
  { id: '4', name: 'Sprint Planning', color: 'bg-green-500', memberCount: 6 },
  { id: '5', name: 'Bug Tracking', color: 'bg-red-500', memberCount: 4 },
];

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const [user, loading] = useAuthState(auth);
  const { initListener: initPresence, setUserOnline, setUserOffline } = usePresenceStore();

  // Get board ID from URL
  const boardId = params.id as string;

  // Check if board ID exists
  const boardExists = mockBoards.some((board) => board.id === boardId);
  const currentBoard = mockBoards.find((board) => board.id === boardId);

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

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', () => handleNetworkChange(true));
    window.addEventListener('offline', () => handleNetworkChange(false));

    // Cleanup function
    return () => {
      setUserPresence(false);
      unsubPresence();

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', () => handleNetworkChange(true));
      window.removeEventListener('offline', () => handleNetworkChange(false));
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

  // Show error page if board doesn't exist
  if (!boardExists) {
    return (
      <main className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">Board Not Found</h2>
            <p className="text-muted-foreground">
              The board with ID &quot;{boardId}&quot; doesn&apos;t exist or you don&apos;t have
              access to it.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => router.push('/board/1')} className="gap-2">
              <Home className="h-4 w-4" />
              Go to Default Board
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto px-0 lg:px-4 pb-8 pt-4">
        {/* You can pass boardId to KanbanBoard if needed */}
        <KanbanBoard />
        {/* Debug: Show current board ID */}
        <div className="fixed bottom-4 right-4 bg-muted px-3 py-1 rounded-md text-sm">
          Board ID: {boardId} - {currentBoard?.name}
        </div>
      </div>
    </main>
  );
}
