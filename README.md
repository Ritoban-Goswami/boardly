# Boardly - Collaborative Task Management Board

🔗 **Live Demo:** https://boardlyv1.vercel.app

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4B5563?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

A modern, real-time collaborative task management board application built with Next.js and Firebase. Boardly enables teams to organize tasks, track work in progress, and collaborate seamlessly with real-time updates.

## Features

- **Multi-Board Support**: Create and manage multiple boards with dynamic routing (`/board/[id]`)
- **Board Management**: Create, edit, delete, and switch between boards with color customization
- **Team Collaboration**: Invite members to boards with role-based access control (Admin, Editor, Viewer)
- **Real-time Collaboration**: Live presence indicators and typing status via Realtime DB; task updates via Firestore
- **Interactive Kanban Board**: Drag-and-drop interface with @hello-pangea/dnd for ordering tasks within and across columns
- **User Authentication**: Secure signup and login with Firebase Authentication
- **Task Management**: Create, edit, and delete tasks with title, description, priority (low/medium/high), labels, and assignments
- **In-app Notifications**: Real-time notification system for task assignments, board invitations, status changes, and team activity
- **Presence Indicators**: See who's online with avatar stack in the navbar
- **Typing Indicators**: See when other users are editing a task
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS v4
- **Dark Mode Support**: Built-in theme switching with next-themes

## Tech Stack

**Framework**

- Next.js (App Router)
- React
- TypeScript

**UI**

- Tailwind CSS v4
- Radix UI
- shadcn/ui
- @hello-pangea/dnd (React Beautiful DnD for React 19)

**Backend & Data**

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database

**State Management**

- Zustand

**Dev Tools**

- ESLint 9 + eslint-config-next
- Prettier + prettier-plugin-tailwindcss
- Husky + lint-staged (pre-commit hooks)
- TypeScript (strict mode)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ritoban-Goswami/boardly.git
   cd boardly
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Set up Firestore Database
   - Set up Realtime Database
   - Create a `.env.local` file with your Firebase config:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
     NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
     ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # App router pages and layouts
│   ├── (protected)/        # Protected routes (require authentication)
│   │   └── board/          # Board routes
│   │       └── [id]/       # Dynamic board page with board ID
│   ├── auth/               # Authentication pages
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── BoardSwitcher.tsx   # Board selection and switching
│   ├── CreateBoardModal.tsx # Create new board modal
│   ├── EditBoardModal.tsx  # Edit board details modal
│   ├── DeleteDialog.tsx    # Confirmation dialog for deletions
│   ├── BoardMembersList.tsx # Board member management
│   ├── InviteModal.tsx     # Invite users to board modal
│   ├── KanbanBoard.tsx     # Main drag-and-drop board
│   ├── TaskCard.tsx        # Task card with priority badges
│   ├── TaskDialog.tsx      # Add/Edit task modal
│   ├── PresenceAvatars.tsx # Online user indicators
│   ├── NotificationIcon.tsx # Notification dropdown
│   ├── NotificationDialog.tsx # Notification details modal
│   ├── Navbar.tsx          # Navigation bar
│   ├── ProtectedRoute.tsx  # Route protection wrapper
│   ├── LoginForm.tsx       # Login form component
│   ├── SignUpForm.tsx      # Signup form component
│   ├── theme-provider.tsx  # Theme context provider
│   └── theme-toggle.tsx    # Dark mode toggle button
├── lib/                    # Utility functions and configurations
│   ├── firebase.ts         # Firebase initialization
│   ├── firestore.ts        # Firestore database operations (boards, tasks, notifications)
│   ├── realtime.ts         # Realtime database operations (presence, typing)
│   └── utils.ts            # Utility helpers (cn, getInitials, etc.)
├── store/                  # Zustand stores
│   ├── useBoards.ts        # Board management store
│   ├── useTasks.ts         # Task management store
│   ├── usePresence.ts      # Online presence store
│   ├── useNotifications.ts # Notifications store
│   └── useUsers.ts         # Users store
└── types/                  # TypeScript type definitions
    └── index.ts            # All interfaces and types (Board, Task, Role, etc.)
```

## Key Implementation Details

### Real-time Collaboration

- Utilizes Firebase Realtime Database for presence detection and typing indicators
- Implements optimistic UI updates for a responsive user experience
- Uses Firestore's real-time listeners for instant data synchronization

### State Management

- **Zustand stores** for modular state management:
  - `useBoards.ts` - Firestore board CRUD with real-time listeners
  - `useTasks.ts` - Firestore task CRUD with real-time listeners
  - `usePresence.ts` - Realtime DB for online status and typing indicators
  - `useNotifications.ts` - User notification management
  - `useUsers.ts` - Cached user data for assignments
- Optimistic UI updates for drag-and-drop task reordering
- Real-time listeners with automatic cleanup on unmount

### Performance Optimizations

- Code splitting with dynamic imports
- Efficient Firestore queries with proper indexing
- Memoized components to prevent unnecessary re-renders
- Server-side rendering for improved initial load performance

## Upcoming Features

### Collaboration Enhancements

- Real-time commenting on tasks
- Activity log with task history tracking
- Task mentions and @mentions in comments
- _Goal_: Improve collaborative UX with real-time interactions

### Advanced Functionality

- Integrated chat for team communication
- Analytics dashboard with task metrics and board insights
- Offline support with optimistic UI updates
- Calendar integration with email reminders
- File attachments for tasks
- Task templates and recurring tasks
- _Goal_: Extend beyond basic kanban with powerful team features

### Security & Permissions

- Enhanced role-based access control enforcement
- Audit logs for board and task changes
- Two-factor authentication support
- _Goal_: Strengthen security and compliance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
