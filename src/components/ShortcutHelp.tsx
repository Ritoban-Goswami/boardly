"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ShortcutHelp({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 text-sm">
          <li>
            <b>/</b> — Focus search
          </li>
          <li>
            <b>n</b> — New task in current column
          </li>
          <li>
            <b>↑ / ↓</b> — Navigate tasks
          </li>
          <li>
            <b>Enter</b> — Edit selected task
          </li>
          <li>
            <b>Del / Backspace</b> — Delete selected task
          </li>
          <li>
            <b>?</b> — Toggle this help
          </li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
