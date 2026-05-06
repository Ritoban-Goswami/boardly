export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  initListener: () => () => void;
}

// Structure: { [taskId: string]: { [userId: string]: boolean } }
type TypingStateType = Record<string, Record<string, boolean>>;

export interface TypingState {
  typing: TypingStateType;
  initListener: () => () => void;
  setTyping: (taskId: string, isTyping: boolean) => void;
}

export type ColumnId = 'todo' | 'in-progress' | 'done' | 'review';

export interface Task {
  id: string;
  title: string;
  status: ColumnId;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  labels?: string[];
  assignedTo?: string;
  order: number; // Used for sorting tasks within a column
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  addTask: (data: Omit<Task, 'id'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export interface PresenceData {
  displayName: string;
  online: boolean;
  lastSeen: number;
  currentTaskViewing?: string;
}

export interface PresenceState {
  presence: Record<string, PresenceData>;
  initListener: () => () => void;
  setUserOnline: (userId: string, displayName: string) => void;
  setUserOffline: (userId: string) => void;
  removeUserPresence: (userId: string) => void;
  setTyping: (taskId: string, isTyping: boolean) => void;
}

export interface UserInfo {
  id: string;
  displayName: string;
  avatar?: string;
}

export interface TaskViewer {
  id: string;
  displayName: string;
}

export type TaskUpdate = {
  id: string;
  updates: {
    status?: ColumnId;
    order?: number;
  };
};

// Notification Types
type NotificationType =
  | 'task_assigned'
  | 'task_status_changed'
  | 'task_priority_updated'
  | 'task_mentioned'
  | 'user_joined_board'
  | 'user_left_board'
  | 'user_editing_task'
  | 'task_completed'
  | 'board_access_granted'
  | 'board_access_revoked'
  | 'board_invitation'
  | 'invitation_accepted'
  | 'invitation_declined';

export interface AppNotification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string; // Short notification title
  message: string; // Detailed message
  actorId?: string; // Who triggered the notification
  boardId?: string; // Related board ID (for invitations)
  read: boolean; // Read status
  createdAt: TimestampLike;
}

type TimestampLike = Date | null;

export interface NotificationsState {
  notifications: AppNotification[];
  loading: boolean;
  initListener: (userId: string) => () => void;
  markAsRead: (notificationId: string) => Promise<void>;
}

// Board types
export interface Board {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  ownerId: string;
  members: Record<string, Role>; // Map of userId -> role
}

export interface BoardsState {
  boards: Board[];
  loading: boolean;
  initListener: () => () => void;
  createBoard: (data: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateBoard: (id: string, updates: Partial<Omit<Board, 'id'>>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
}
