"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnId, Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function TaskDialog({
  open = false,
  onOpenChange = () => {},
  mode = "add",
  initialTitle = "",
  initialDescription = "",
  initialLabels = [],
  initialPriority = "medium",
  onSubmit = () => {},
  column = "todo",
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  mode?: "add" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialLabels?: string[];
  initialPriority?: Task["priority"];
  onSubmit?: (values: Partial<Task>) => void;
  column?: ColumnId;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [labels, setLabels] = useState<string[]>(initialLabels);
  const [labelInput, setLabelInput] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>(initialPriority);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
      setLabels(initialLabels);
      setPriority(initialPriority);
    }
  }, [open, initialTitle, initialDescription, initialLabels, initialPriority]);

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
    setLabelInput("");
  }

  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Task" : "Edit Task"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "Create a new task" : "Update task details"} in{" "}
            <span className="font-medium">
              {column === "todo"
                ? "To Do"
                : column === "inprogress"
                ? "In Progress"
                : "Done"}
            </span>
          </DialogDescription>
        </DialogHeader>
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
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Task["priority"])}
              >
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLabelFromInput();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addLabelFromInput}
              >
                Add
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {labels.map((l) => (
                <Badge key={l} variant="secondary" className="bg-gray-100">
                  <span className="mr-2">{l}</span>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="active:scale-[0.98] transition">
              {mode === "add" ? "Add Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
