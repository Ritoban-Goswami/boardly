'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Layout, Users, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock data for UI demonstration
const mockBoards = [
  { id: '1', name: 'Marketing Campaign', color: 'bg-blue-500', memberCount: 5 },
  { id: '2', name: 'Product Roadmap', color: 'bg-purple-500', memberCount: 8 },
  { id: '3', name: 'Design System', color: 'bg-pink-500', memberCount: 3 },
  { id: '4', name: 'Sprint Planning', color: 'bg-green-500', memberCount: 6 },
  { id: '5', name: 'Bug Tracking', color: 'bg-red-500', memberCount: 4 },
];

interface BoardSwitcherProps {
  className?: string;
}

export default function BoardSwitcher({ className }: BoardSwitcherProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const params = useParams();

  // Get current board ID from URL
  const currentBoardId = (params.id as string) || '1';

  const filteredBoards = mockBoards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            {filteredBoards.map((board) => (
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
                          {board.memberCount} members
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Active Indicator - Only when collapsed */}
                  {isCollapsed && currentBoardId === board.id && (
                    <div className="absolute right-2 h-2 w-2 rounded-full bg-primary" />
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
            className={cn('w-full justify-start gap-3 h-10', isCollapsed && 'justify-center px-0')}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Create board</span>}
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
  );
}
