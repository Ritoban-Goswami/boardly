'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { AppNotification } from '@/types';
import { Check, X } from 'lucide-react';

interface NotificationDialogProps {
  notification: AppNotification | null;
  onOpenChange: (open: boolean) => void;
  onAcceptInvitation?: (notificationId: string) => void;
  onDeclineInvitation?: (notificationId: string) => void;
}

export function NotificationDialog({
  notification,
  onOpenChange,
  onAcceptInvitation,
  onDeclineInvitation,
}: NotificationDialogProps) {
  if (!notification) return null;

  const isInvitation = notification.type === 'board_invitation';

  const handleAccept = () => {
    if (onAcceptInvitation) {
      onAcceptInvitation(notification.id);
    }
    onOpenChange(false);
  };

  const handleDecline = () => {
    if (onDeclineInvitation) {
      onDeclineInvitation(notification.id);
    }
    onOpenChange(false);
  };

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

          {/* Invitation Actions */}
          {isInvitation && (
            <div className="flex gap-2 pt-2">
              <Button onClick={handleAccept} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button onClick={handleDecline} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
