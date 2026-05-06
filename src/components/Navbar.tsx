'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, LogOut, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PresenceAvatars from './PresenceAvatars';
import NotificationIcon from './NotificationIcon';
import { useCallback, useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getInitials, stringToColor } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { usePresenceStore } from '@/store/usePresence';
import { useNotificationsStore } from '@/store/useNotifications';
import { CreateBoardModal } from './CreateBoardModal';

export default function Navbar() {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const { removeUserPresence } = usePresenceStore();
  const { initListener: initNotifications } = useNotificationsStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = useCallback(async () => {
    if (user) {
      removeUserPresence(user.uid);
    }
    await signOut(auth);
    router.push('/auth/login');
  }, [router, user, removeUserPresence]);

  // Initialize notification listener
  useEffect(() => {
    if (user) {
      const unsub = initNotifications(user.uid);
      return unsub;
    }
  }, [user, initNotifications]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold tracking-tight">Boardly</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <PresenceAvatars />
            <NotificationIcon />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New board</span>
            </Button>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                  <Avatar className={`h-8 w-8 ${stringToColor(user?.uid || '')}`}>
                    <AvatarFallback className="bg-transparent">{getInitials(user)}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Create Board Modal */}
      <CreateBoardModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
}
