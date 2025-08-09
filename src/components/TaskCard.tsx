"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";
import type { Task, User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function TaskCard({
  task,
  users,
}: {
  task: Task;
  users: User[];
}) {
  const assignee = users.find((u) => u.id === task.assigneeId);
  const due = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <Card className="p-3 hover:shadow-sm transition-shadow rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full border",
            task.status === "done" &&
              "bg-emerald-50 text-emerald-700 border-emerald-200",
            task.status === "inprogress" &&
              "bg-amber-50 text-amber-700 border-amber-200",
            task.status === "todo" &&
              "bg-slate-50 text-slate-700 border-slate-200"
          )}
        >
          {task.status === "inprogress"
            ? "In Progress"
            : task.status === "todo"
            ? "To Do"
            : "Done"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={`/placeholder.svg?height=48&width=48&query=${encodeURIComponent(
                (assignee?.name ?? "User") + " avatar"
              )}`}
              alt={`${assignee?.name ?? "Assignee"} avatar`}
            />
            <AvatarFallback>
              {assignee?.name?.slice(0, 2).toUpperCase() ?? "US"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {assignee?.name ?? "Unassigned"}
          </span>
        </div>
        {due && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" />
            <time dateTime={due.toISOString()}>{due.toLocaleDateString()}</time>
          </div>
        )}
      </div>
    </Card>
  );
}
