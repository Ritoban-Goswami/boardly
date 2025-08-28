'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function NotificationIcon() {
  const [open, setOpen] = useState(false);

  // Hardcoded data for demo purposes
  const unreadCount = 3;
  const notifications = [
    {
      id: '1',
      title: 'Task Assigned',
      message: 'You have been assigned to "Design new landing page"',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '2',
      title: 'Board Updated',
      message: 'The "Marketing Campaign" board has been updated with new tasks',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: '3',
      title: 'Team Member Joined',
      message: 'Sarah Johnson has joined the "Product Development" board',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: '4',
      title: 'Task Completed',
      message: 'The task "Review user feedback" has been marked as completed',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      id: '5',
      title: 'Priority Changed',
      message: 'The priority of "Bug fix #123" has been updated to High',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
  ];

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    // For demo purposes, just log the action
    console.log(`Notification ${notificationId} clicked, read: ${isRead}`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Feature Coming Soon Banner */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-700 font-medium">Feature Coming Soon</p>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Real-time notifications will be available in the next update
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4">
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs">You&apos;ll see notifications here when they arrive</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p
                          className={`text-sm font-medium ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
