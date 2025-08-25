'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn, getInitials, stringToColor } from '@/lib/utils';
import { Button } from './ui/button';
import { Pencil, Trash2, Tag, Eye } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsersStore } from '@/store/useUsers';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  usersViewing: UserInfo[];
}

export default function TaskCard({ task, onEdit, onDelete, usersViewing }: TaskCardProps) {
  const { users } = useUsersStore();
  const assignedUser = task.assignedTo ? users.find((u) => u.uid === task.assignedTo) : null;

  const priorityColors: Record<Task['priority'], string> = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-rose-100 text-rose-700',
  };

  return (
    <Card
      className="group relative w-full hover:border-stone-300 py-0 cursor-grab active:cursor-grabbing"
      onClick={onEdit}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate font-semibold">{task.title}</div>
              <Badge
                className={cn(
                  'h-5 px-1.5 rounded text-[10px] capitalize',
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </Badge>
            </div>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
            )}
            {/* User avatars for viewers */}
          </div>
          <div className="hidden xl:flex ml-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        {assignedUser && (
          <div className="flex items-center gap-1.5 mt-4">
            <Avatar
              className={`h-6 w-6 border-2 border-primary/30 ${stringToColor(assignedUser.uid)} cursor-pointer ring-1 ring-primary/20`}
              title={`Assigned to ${assignedUser.displayName}`}
            >
              <AvatarFallback className="text-[11px] bg-transparent">
                {getInitials(assignedUser)}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] font-semibold text-foreground">
              {assignedUser.displayName}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-2 items-center mt-3">
          <div className="flex flex-wrap items-center gap-2">
            {task.labels?.map((l) => (
              <Badge
                key={l}
                variant="secondary"
                className="rounded text-[10px] bg-stone-100 dark:bg-stone-800"
              >
                <Tag className="h-3 w-3" />
                {l}
              </Badge>
            ))}
          </div>
          {usersViewing.length > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-green-400" aria-hidden="true" />
              <div className="flex justify-end -space-x-2">
                {usersViewing.slice(0, 2).map((user) => (
                  <Avatar
                    key={user.id}
                    className={`h-5 w-5 ${stringToColor(user.id)} border border-green-400/50`}
                    title={`${user.displayName} (Viewing)`}
                  >
                    <AvatarFallback className="text-[9px] bg-transparent">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {usersViewing.length > 2 && (
                  <Avatar className="h-5 w-5 border border-green-400/50 bg-green-200 dark:bg-green-900">
                    <AvatarFallback className="text-[9px] bg-transparent dark:text-green-200">
                      +{usersViewing.length - 2}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
