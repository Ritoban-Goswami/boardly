'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresenceStore } from '@/store/usePresence';
import { getInitials, stringToColor } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export default function PresenceAvatars() {
  const { presence } = usePresenceStore();
  const [currentUser] = useAuthState(auth);

  // Convert presence object to array of users and filter out current user
  const users = presence
    ? Object.entries(presence)
        .filter(([id]) => id !== currentUser?.uid) // Exclude current user
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
