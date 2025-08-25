interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
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
}

interface PresenceState {
  presence: Record<string, PresenceData>;
  initListener: () => () => void;
  setUserOnline: (userId: string, displayName: string) => void;
}

interface UserInfo {
  id: string;
  displayName: string;
}
