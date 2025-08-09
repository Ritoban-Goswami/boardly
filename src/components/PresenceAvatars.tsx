"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const users = [
  { id: "u_1", name: "Alex Kim", isOnline: true },
  { id: "u_2", name: "Sam Lee", isOnline: true },
  { id: "u_3", name: "Jordan Park", isOnline: false },
  { id: "u_4", name: "Taylor Ray", isOnline: false },
];

export default function PresenceAvatars() {
  return (
    <div className="flex -space-x-2">
      {users.map((u) => (
        <Avatar
          key={u.id}
          className="h-7 w-7 ring-2 ring-white"
          style={{ backgroundColor: u.color, color: "white" }}
          title={u.name}
        >
          <AvatarFallback
            className="text-[10px] font-bold uppercase"
            style={{ backgroundColor: u.color }}
          >
            {u.initials}
          </AvatarFallback>
        </Avatar>
      ))}
      {users.length === 0 ? (
        <div className="text-xs text-muted-foreground">No collaborators</div>
      ) : null}
    </div>
  );
}
