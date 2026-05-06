'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresenceStore } from '@/store/usePresence';
import { useBoards } from '@/store/useBoards';
import { getInitials, stringToColor } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useParams } from 'next/navigation';

export default function PresenceAvatars() {
  const { presence } = usePresenceStore();
  const { boards } = useBoards();
  const [currentUser] = useAuthState(auth);
  const params = useParams();

  const boardId = params.id as string | undefined;
  const currentBoard = boardId ? boards.find((b) => b.id === boardId) : undefined;
  const boardMembers = currentBoard?.members;

  // Convert presence object to array of users and filter out current user and non-members
  const users = presence
    ? Object.entries(presence)
        .filter(([id]) => {
          // Exclude current user
          if (id === currentUser?.uid) return false;
          // Filter by board members if on a board page
          if (boardMembers && !(id in boardMembers)) return false;
          return true;
        })
        .map(([id, userData]) => ({
          id,
          displayName: userData.displayName,
          isOnline: userData.online,
          lastSeen: userData.lastSeen,
        }))
    : [];

  const onlineUsers = users.filter((user) => user.isOnline);

  return (
    <div className="flex -space-x-0.5">
      {onlineUsers.map((user) => (
        <Avatar
          key={user.id}
          className={`h-5 w-5 ring-2 ring-white ring-green-400 ring-offset-1 ${stringToColor(user.id)}`}
          title={`${user.displayName} (${user.isOnline ? 'Online' : 'Offline'})`}
        >
          <AvatarFallback className="bg-transparent text-[10px] font-bold uppercase">
            {getInitials(user)}
          </AvatarFallback>
        </Avatar>
      ))}
      {onlineUsers.length === 0 ? (
        <div className="hidden sm:flex text-xs text-muted-foreground">
          No other collaborators online
        </div>
      ) : null}
    </div>
  );
}
