'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/useUsers';
import { createNotification } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import type { User, Role } from '@/types';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
  currentMembers: Record<string, Role>;
}

export function InviteModal({
  open,
  onOpenChange,
  boardId,
  boardName,
  currentMembers,
}: InviteModalProps) {
  const { users, initListener } = useUsersStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    const unsub = initListener();
    return () => unsub();
  }, [initListener]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = users.filter(
        (user) =>
          !(user.uid in currentMembers) &&
          (user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;

    const inviterId = auth.currentUser?.uid;
    if (!inviterId) {
      console.error('User not authenticated');
      return;
    }

    setIsInviting(true);
    try {
      // Create notification for each selected user
      await Promise.all(
        selectedUsers.map((userId) =>
          createNotification(
            userId,
            'board_invitation',
            `You've been invited to ${boardName}`,
            `You have been invited to join the board "${boardName}". Click to accept or decline this invitation.`,
            inviterId,
            boardId
          )
        )
      );

      // Reset and close
      setSelectedUsers([]);
      setSearchQuery('');
      setSearchResults([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to invite users:', error);
    } finally {
      setIsInviting(false);
    }
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Invite to {boardName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10"
              disabled={isInviting}
              autoFocus
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((userId) => {
                const user = users.find((u) => u.uid === userId);
                if (!user) return null;
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-1 bg-muted rounded-full pl-2 pr-1 py-1 text-sm"
                  >
                    <span>{user.displayName}</span>
                    <button
                      onClick={() => removeSelectedUser(userId)}
                      className="text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {searchResults.map((user) => {
                const isSelected = selectedUsers.includes(user.uid);
                return (
                  <div
                    key={user.uid}
                    onClick={() => !isSelected && toggleUserSelection(user.uid)}
                    className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 ${
                      isSelected ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isInviting}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedUsers.length === 0 || isInviting}
              size="sm"
            >
              {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Invite`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
