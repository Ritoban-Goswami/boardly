'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useBoards } from '@/store/useBoards';
import Navbar from '@/components/Navbar';
import { CreateBoardModal } from '@/components/CreateBoardModal';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { boards, loading: boardsLoading } = useBoards();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isLoading = loading || boardsLoading;

  // Redirect to first board once data is loaded
  useEffect(() => {
    if (!isLoading && user && boards.length > 0) {
      router.replace(`/board/${boards[0].id}`);
    }
  }, [isLoading, user, boards, router]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [loading, user, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-2">
              <CheckSquare
                className="size-10 text-primary animate-bounce"
                style={{
                  animationDuration: '2s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
                }}
              />
              <h1 className="text-2xl font-bold text-foreground">Boardly</h1>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Not authenticated — prevent flash while redirecting
  if (!user) return null;

  // Authenticated but no boards — show empty state
  if (boards.length === 0) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen w-full items-center justify-center bg-background px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex items-center justify-center gap-2">
              <CheckSquare className="size-10 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Boardly</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No boards yet</h2>
              <p className="text-muted-foreground">
                Create your first board to start organizing tasks and collaborating with your team.
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Board
            </Button>
            <CreateBoardModal open={showCreateModal} onOpenChange={setShowCreateModal} />
          </div>
        </div>
      </>
    );
  }

  // Should have redirected — prevent flash
  return null;
}
