"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getInitials, stringToColor } from "@/lib/utils";
import { Button } from "./ui/button";
import { Pencil, Trash2, Tag } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserInfo {
  id: string;
  displayName: string;
}

export default function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  usersViewing,
}: {
  task: Task;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  usersViewing: UserInfo[];
}) {
  const priorityColors: Record<Task["priority"], string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };
  return (
    <Card
      className={cn("group relative w-full transition-shadow hover:shadow-sm")}
      onClick={onClick}
      role="button"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate font-medium">{task.title}</div>
              <Badge
                className={cn(
                  "h-5 px-1.5 text-[10px]",
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </Badge>
            </div>
            {task.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {task.description}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {task.labels?.map((l) => (
                <Badge key={l} variant="secondary" className="bg-gray-100">
                  <Tag className="mr-1 h-3 w-3" />
                  {l}
                </Badge>
              ))}
            </div>
            {/* User avatars for viewers */}
            {usersViewing.length > 0 && (
              <div className="mt-2 flex -space-x-2">
                {usersViewing.map((user) => (
                  <Avatar
                    key={user.id}
                    className="h-6 w-6 border-2 border-background"
                    style={{ backgroundColor: stringToColor(user.id) }}
                    title={`${user.displayName} (Viewing)`}
                  >
                    <AvatarFallback className="text-[10px] bg-transparent">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            )}
          </div>
          <div className="ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
