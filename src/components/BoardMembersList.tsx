'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import type { User } from '@/types';

interface BoardMembersListProps {
  members: User[];
  ownerId: string;
  currentUserId: string;
}

export function BoardMembersList({ members, ownerId, currentUserId }: BoardMembersListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Board Members</h3>
        <Badge variant="outline" className="text-xs">
          {members.length}
        </Badge>
      </div>

      <div className="space-y-1">
        {members.map((member) => {
          const isOwner = member.uid === ownerId;
          const isCurrentUser = member.uid === currentUserId;

          return (
            <div
              key={member.uid}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {member.displayName || 'Unknown User'}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email || ''}</p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                  <Crown className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Owner</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
