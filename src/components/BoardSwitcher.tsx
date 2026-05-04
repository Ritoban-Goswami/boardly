'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Layout,
  Users,
  Settings,
  Search,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useBoards } from '@/store/useBoards';
import { EditBoardModal } from './EditBoardModal';
import { CreateBoardModal } from './CreateBoardModal';
import type { Board } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

interface BoardSwitcherProps {
  className?: string;
}

export default function BoardSwitcher({ className }: BoardSwitcherProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const { boards, loading, deleteBoard } = useBoards();

  // Get current board ID from URL
  const currentBoardId = params.id as string;

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEditModal = (board: Board) => {
    setEditingBoard(board);
    setShowEditModal(true);
  };

  const handleOpenDeleteDialog = (board: Board) => {
    setDeletingBoard(board);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBoard = async () => {
    if (!deletingBoard) return;

    setIsDeleting(true);
    try {
      await deleteBoard(deletingBoard.id);
      setShowDeleteDialog(false);
      // If deleting the current board, navigate to home
      if (currentBoardId === deletingBoard.id) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'relative flex h-full bg-muted/40 border-r transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Sidebar Content */}
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className="p-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <span className="font-semibold">Boardly</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <Layout className="h-6 w-6 text-primary" />
              </div>
            )}
          </div>

          {/* Search Bar - Hidden when collapsed */}
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          )}

          {/* Boards List */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 p-2">
              {loading
                ? // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full rounded-lg p-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                        {!isCollapsed && (
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
                            <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                : filteredBoards.map((board) => (
                    <div key={board.id} className="relative group">
                      <Link
                        href={`/board/${board.id}`}
                        className={cn(
                          'w-full rounded-lg text-left transition-colors hover:bg-accent block',
                          isCollapsed ? 'p-2 flex justify-center' : 'p-3',
                          currentBoardId === board.id ? 'bg-accent' : 'transparent'
                        )}
                        title={board.name}
                      >
                        <div className={cn('flex items-center', isCollapsed ? '' : 'gap-3')}>
                          {/* Board Color Indicator */}
                          <div
                            className={cn(
                              'rounded-full flex-shrink-0 transition-all',
                              isCollapsed ? 'h-5 w-5' : 'h-3 w-3',
                              board.color,
                              currentBoardId === board.id &&
                                !isCollapsed &&
                                'ring-2 ring-primary ring-offset-2',
                              currentBoardId === board.id &&
                                isCollapsed &&
                                'ring-2 ring-primary ring-offset-2 scale-110'
                            )}
                          />

                          {/* Board Info - Hidden when collapsed */}
                          {!isCollapsed && (
                            <div className="min-w-0 flex-1 pr-8">
                              <p className="truncate text-sm font-medium">{board.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {board.members.length} members
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Kebab Menu - Only show when not collapsed */}
                      {!isCollapsed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(board)}
                              className="cursor-pointer"
                            >
                              Edit board
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDeleteDialog(board)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                              disabled={isDeleting}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting ? 'Deleting...' : 'Delete board'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
            </div>

            {/* New Board Button - Always visible */}
            <div className={cn('p-2', isCollapsed ? 'flex justify-center' : '')}>
              <Button
                variant={isCollapsed ? 'ghost' : 'outline'}
                size={isCollapsed ? 'icon' : 'sm'}
                onClick={() => setShowCreateModal(true)}
                className={cn(isCollapsed ? 'h-9 w-9' : 'w-full gap-2')}
                title="New board"
              >
                <Plus className={cn(isCollapsed ? 'h-4 w-4' : 'h-4 w-4')} />
                {!isCollapsed && <span>New board</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Board Modal */}
      <EditBoardModal open={showEditModal} onOpenChange={setShowEditModal} board={editingBoard} />

      {/* Create Board Modal */}
      <CreateBoardModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      {/* Delete Board Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingBoard?.name}&quot;? This action cannot
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
    </>
  );
}
