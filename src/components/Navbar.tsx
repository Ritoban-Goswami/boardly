'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckSquare, LogOut, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PresenceAvatars from './PresenceAvatars';
import { useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getInitials, stringToColor } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';

export default function Navbar() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push('auth/login');
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/board" className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Boardly</span>
          </Link>
          <div className="flex items-center gap-2">
            <PresenceAvatars />
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
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy board link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
