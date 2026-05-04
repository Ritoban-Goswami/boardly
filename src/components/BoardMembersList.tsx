'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, User as UserIcon } from 'lucide-react';
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
        <h3 className="text-sm font-semibold">Members ({members.length})</h3>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const isOwner = member.uid === ownerId;
          const isCurrentUser = member.uid === currentUserId;

          return (
            <div
              key={member.uid}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {member.displayName || 'Unknown User'}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {member.email || 'No email'}
                </p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs font-medium">Owner</span>
                </div>
              )}

              {!isOwner && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-xs">Member</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
