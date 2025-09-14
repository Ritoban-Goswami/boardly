'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

interface NotificationDialogProps {
  notification: AppNotification | null;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDialog({ notification, onOpenChange }: NotificationDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={!!notification} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="notification-details">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{notification.title}</DialogTitle>
        </DialogHeader>
        <div id="notification-details" className="space-y-4">
          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-sm text-foreground">{notification.message}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Type: <span className="capitalize">{notification.type}</span>
            </p>
            <p>Date: {formatDate(notification.createdAt)}</p>
            {notification.actorId && <p>From: User ID {notification.actorId}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
