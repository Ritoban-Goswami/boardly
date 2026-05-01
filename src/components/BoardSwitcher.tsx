'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Layout, Users, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useBoards } from '@/store/useBoards';
import { CreateBoardModal } from './CreateBoardModal';

interface BoardSwitcherProps {
  className?: string;
}

export default function BoardSwitcher({ className }: BoardSwitcherProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const params = useParams();
  const { boards, loading } = useBoards();

  // Get current board ID from URL
  const currentBoardId = params.id as string;

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <Layout className="h-5 w-5 text-primary" />
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
                    <Link
                      key={board.id}
                      href={`/board/${board.id}`}
                      className={cn(
                        'w-full rounded-lg p-3 text-left transition-colors hover:bg-accent block',
                        currentBoardId === board.id ? 'bg-accent' : 'transparent'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Board Color Indicator */}
                        <div className={cn('h-3 w-3 rounded-full flex-shrink-0', board.color)} />

                        {/* Board Info - Hidden when collapsed */}
                        {!isCollapsed && (
                          <div className="min-w-0 flex-1">
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
                  ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-2 border-t">
            {/* Create Board Button */}
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(true)}
              className={cn(
                'w-full justify-start gap-3 h-10',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && 'Create board'}
            </Button>

            {/* Settings Button - Only when not collapsed */}
            {!isCollapsed && (
              <Button variant="ghost" className="w-full justify-start gap-3 h-10 mt-1">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
}
