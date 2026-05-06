'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Eye } from 'lucide-react';
import type { User, Role } from '@/types';

interface BoardMembersListProps {
  members: Record<string, Role>;
  users: User[];
  ownerId: string;
  currentUserId: string;
}

export function BoardMembersList({
  members,
  users,
  ownerId,
  currentUserId,
}: BoardMembersListProps) {
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (userId: string, role: Role) => {
    const isOwner = userId === ownerId;

    if (isOwner) {
      return (
        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
          <Crown className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Owner</span>
        </div>
      );
    }

    switch (role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="text-xs">
            Admin
          </Badge>
        );
      case 'editor':
        return (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Editor</span>
          </div>
        );
      case 'viewer':
        return (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Viewer</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Board Members</h3>
        <Badge variant="outline" className="text-xs">
          {Object.keys(members).length}
        </Badge>
      </div>

      <div className="space-y-1">
        {Object.entries(members).map(([userId, role]) => {
          const user = users.find((u) => u.uid === userId);
          const isCurrentUser = userId === currentUserId;

          return (
            <div
              key={userId}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(user?.displayName || null)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {user?.displayName || 'Unknown User'}
                  </p>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
              </div>

              {getRoleBadge(userId, role)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
