'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ColumnId, Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, stringToColor } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface UserInfo {
  id: string;
  displayName: string;
}

export default function TaskDialog({
  open = false,
  onOpenChange = () => {},
  mode = 'add',
  initialTask = null,
  onSubmit = () => {},
  column = 'todo',
  usersViewing = [],
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  mode?: 'add' | 'edit';
  initialTask?: Task;
  onSubmit?: (values: Partial<Task>) => void;
  column?: ColumnId;
  usersViewing?: UserInfo[];
}) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [labels, setLabels] = useState<string[]>(initialTask?.labels ?? []);
  const [labelInput, setLabelInput] = useState('');
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority ?? 'medium');

  useEffect(() => {
    if (open) {
      setTitle(initialTask?.title ?? '');
      setDescription(initialTask?.description ?? '');
      setLabels(initialTask?.labels ?? []);
      setPriority(initialTask?.priority ?? 'medium');
    }
  }, [open, initialTask]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      labels,
      priority,
    });
  }

  function addLabelFromInput() {
    const v = labelInput.trim();
    if (!v) return;
    if (!labels.includes(v)) setLabels((prev) => [...prev, v]);
    setLabelInput('');
  }

  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{mode === 'add' ? 'Add Task' : 'Edit Task'}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription>
          {mode === 'add' ? 'Create a new task' : 'Update task details'} in{' '}
          <span className="font-medium">
            {column === 'todo' ? 'To Do' : column === 'inprogress' ? 'In Progress' : 'Done'}
          </span>
          {usersViewing.length > 0 && (
            <div
              className="mt-3 flex items-center gap-2 rounded-md border bg-muted/50 px-2.5 py-1.5 w-fit"
              aria-label="users-viewing"
              role="group"
            >
              <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Currently viewing</span>
              <div className="flex items-center gap-2">
                <span className="flex -space-x-2">
                  {usersViewing.slice(0, 3).map((user) => (
                    <>
                      <Avatar
                        key={user.id}
                        className="h-6 w-6 border-2 border-background"
                        style={{ backgroundColor: stringToColor(user.id) }}
                        title={user.displayName}
                      >
                        <AvatarFallback className="text-[10px] bg-transparent">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </>
                  ))}
                  {usersViewing.length > 3 && (
                    <Avatar
                      className="h-6 w-6 border-2 border-background bg-muted text-muted-foreground "
                      title={`+${usersViewing.length - 3}`}
                    >
                      <AvatarFallback className="text-[10px] bg-transparent">
                        +{usersViewing.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogDescription>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Add a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add label and press Enter"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLabelFromInput();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addLabelFromInput}>
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {labels.map((l) => (
                <Badge key={l} variant="secondary" className="bg-gray-100">
                  <span className="mr-1">{l}</span>
                  <button
                    type="button"
                    className="rounded px-1 text-xs text-muted-foreground hover:bg-muted"
                    onClick={() => removeLabel(l)}
                  >
                    ✕
                  </button>
                </Badge>
              ))}
              {labels.length === 0 ? (
                <span className="text-xs text-muted-foreground">No labels</span>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="active:scale-[0.98] transition">
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
