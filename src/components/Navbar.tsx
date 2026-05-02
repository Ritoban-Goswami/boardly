'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { CheckSquare, LogOut, Share2, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PresenceAvatars from './PresenceAvatars';
import NotificationIcon from './NotificationIcon';
import { useCallback, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getInitials, stringToColor } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { usePresenceStore } from '@/store/usePresence';
import { useBoards } from '@/store/useBoards';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateBoardModal } from './CreateBoardModal';

export default function Navbar() {
  const router = useRouter();
  const params = useParams();
  const [user] = useAuthState(auth);
  const { removeUserPresence } = usePresenceStore();
  const { boards, deleteBoard } = useBoards();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const boardId = params.id as string | undefined;
  const currentBoard = boardId ? boards.find((b) => b.id === boardId) : undefined;

  const handleLogout = useCallback(async () => {
    if (user) {
      removeUserPresence(user.uid);
    }
    await signOut(auth);
    router.push('/auth/login');
  }, [router, user, removeUserPresence]);

  const openDeleteDialog = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDeleteBoard = useCallback(async () => {
    if (!currentBoard) return;

    setIsDeleting(true);
    try {
      await deleteBoard(currentBoard.id);
      setShowDeleteDialog(false);
      router.push('/');
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [currentBoard, deleteBoard, router]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold tracking-tight">Boardly</span>
            </Link>
            {currentBoard && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                  {currentBoard.name}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Copy board link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={openDeleteDialog}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete board'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PresenceAvatars />
            <NotificationIcon />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New board</span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <Avatar className={`h-8 w-8 ${stringToColor(user?.uid || '')}`}>
                    <AvatarFallback className="bg-transparent">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy board link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Delete Board Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{currentBoard?.name}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteBoard} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Board Modal */}
      <CreateBoardModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
}
