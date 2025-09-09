/* eslint-disable @typescript-eslint/no-unused-vars */
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UsersState {
  users: User[];
  loading: boolean;
  initListener: () => () => void;
}

// Structure: { [taskId: string]: { [userId: string]: boolean } }
type TypingStateType = Record<string, Record<string, boolean>>;

interface TypingState {
  typing: TypingStateType;
  initListener: () => () => void;
  setTyping: (taskId: string, isTyping: boolean) => void;
}

type ColumnId = 'todo' | 'in-progress' | 'done' | 'review';

interface Task {
  id: string;
  title: string;
  status: ColumnId;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  labels?: string[];
  assignedTo?: string;
  order: number; // Used for sorting tasks within a column
}

interface TasksState {
  tasks: Task[];
  loading: boolean;
  initListener: () => () => void;
  addTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

interface PresenceData {
  displayName: string;
  online: boolean;
  lastSeen: number;
  currentTaskViewing?: string;
}

interface PresenceState {
  presence: Record<string, PresenceData>;
  initListener: () => () => void;
  setUserOnline: (userId: string, displayName: string) => void;
  setUserOffline: (userId: string) => void;
  removeUserPresence: (userId: string) => void;
  setTyping: (taskId: string, isTyping: boolean) => void;
}

interface UserInfo {
  id: string;
  displayName: string;
}

interface TaskViewer {
  id: string;
  displayName: string;
}

type TaskUpdate = {
  id: string;
  updates: {
    status?: ColumnId;
    order: number;
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
  | 'board_access_revoked';

interface AppNotification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string; // Short notification title
  message: string; // Detailed message
  actorId?: string; // Who triggered the notification
  read: boolean; // Read status
  createdAt: TimestampLike;
}

type TimestampLike = Date | null;

interface NotificationsState {
  notifications: AppNotification[];
  loading: boolean;
  initListener: (userId: string) => () => void;
}
