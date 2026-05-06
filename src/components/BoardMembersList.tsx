'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Crown, Shield, Eye, MoreVertical, Trash2 } from 'lucide-react';
import type { User, Role } from '@/types';
import { removeBoardMember, updateBoardMemberRole } from '@/lib/firestore';

interface BoardMembersListProps {
  members: Record<string, Role>;
  users: User[];
  ownerId: string;
  currentUserId: string;
  boardId: string;
}

export function BoardMembersList({
  members,
  users,
  ownerId,
  currentUserId,
  boardId,
}: BoardMembersListProps) {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    displayName: string;
  } | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

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

  const canManageMembers = () => {
    const currentUserRole = members[currentUserId];
    return currentUserId === ownerId || currentUserRole === 'admin';
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingRole(userId);
    try {
      await updateBoardMemberRole(boardId, userId, newRole);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeBoardMember(boardId, memberToRemove.userId);
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const openRemoveDialog = (userId: string, displayName: string) => {
    setMemberToRemove({ userId, displayName });
    setRemoveDialogOpen(true);
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
          const isOwner = userId === ownerId;
          const canManageThisMember = canManageMembers() && !isOwner;

          return (
            <div
              key={userId}
              className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors group"
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

              {canManageThisMember && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(userId, 'admin')}
                      disabled={updatingRole === userId || role === 'admin'}
                    >
                      <Shield className="h-4 w-4 mr-2 text-destructive" />
                      Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(userId, 'editor')}
                      disabled={updatingRole === userId || role === 'editor'}
                    >
                      <Shield className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-500" />
                      Editor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(userId, 'viewer')}
                      disabled={updatingRole === userId || role === 'viewer'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Viewer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => openRemoveDialog(userId, user?.displayName || 'Unknown User')}
                      className="text-destructive"
                      disabled={isCurrentUser}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Board Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {memberToRemove?.displayName} from this board? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
