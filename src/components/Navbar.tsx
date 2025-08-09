"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Download,
  FileUp,
  HelpCircle,
  LogOut,
  Share2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PresenceAvatars from "./PresenceAvatars";
import ShortcutHelp from "./ShortcutHelp";
import { useCallback, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push("auth/login");
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/board" className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">
              TaskFlow
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setHelpOpen(true);
                }}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Shortcuts
              </Button>
            </div>

            <PresenceAvatars />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User avatar"
                    />
                    <AvatarFallback>TF</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer"
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy board link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ShortcutHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
