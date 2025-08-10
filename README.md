# Boardly - Collaborative Task Management Board

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-4B5563?style=for-the-badge&logo=react&logoColor=white)](https://zustand-demo.pmnd.rs/)

A modern, real-time collaborative task management board application built with Next.js and Firebase. Boardly enables teams to organize tasks, track work in progress, and collaborate seamlessly with real-time updates.

## Features

- **Real-time Collaboration**: See team members' activities and updates instantly
- **Interactive Kanban Board**: Drag-and-drop interface for managing tasks across columns
- **User Authentication**: Secure signup and login with Firebase Authentication
- **Task Management**: Create, edit, and delete tasks with rich details
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Presence Indicators**: See who's online and what they're working on

## Tech Stack

- **Frontend**:
  - Next.js 13+ (App Router)
  - React 18+
  - TypeScript
  - Tailwind CSS
  - Radix UI (accessible UI components)
  - React Beautiful DnD (drag and drop)

- **Backend & Database**:
  - Firebase Authentication
  - Cloud Firestore (NoSQL database)
  - Firebase Realtime Database (presence and typing indicators)

- **State Management**:
  - Zustand (lightweight state management)

- **Development Tools**:
  - ESLint (code linting)
  - Prettier (code formatting)
  - TypeScript (type checking)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/boardly.git
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
     ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # App router pages and layouts
│   ├── (protected)/        # Protected routes (require authentication)
│   │   └── board/          # Main board page
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn/ui components
│   ├── KanbanBoard.tsx     # Main board component
│   ├── TaskCard.tsx        # Task card component
│   └── ...
├── lib/                    # Utility functions and configurations
│   └── firebase.ts         # Firebase initialization
└── stores/                 # Zustand stores
    ├── task-store.ts       # Task management store
    └── auth-store.ts       # Authentication store
```

## Key Implementation Details

### Real-time Collaboration

- Utilizes Firebase Realtime Database for presence detection and typing indicators
- Implements optimistic UI updates for a responsive user experience
- Uses Firestore's real-time listeners for instant data synchronization

### State Management

- Combines Zustand for client state
- Implements optimistic updates for a snappy UI
- Centralized stores for better state organization

### Performance Optimizations

- Code splitting with dynamic imports
- Efficient Firestore queries with proper indexing
- Memoized components to prevent unnecessary re-renders
- Server-side rendering for improved initial load performance

## Upcoming Features

### Role-Based Access Control

- **Roles**: Admin, Editor, and Viewer permissions
- **Admin Privileges**: Add/remove collaborators, manage boards
- **Editor Access**: Comment and move tasks (no user management)
- **Viewer Mode**: Read-only access to tasks
- _Goal_: Implement secure front-end RBAC design

### Collaboration Enhancements

- Real-time commenting on tasks
- In-app notifications for assignments and mentions
- Activity log with task history tracking
- _Goal_: Improve collaborative UX with real-time interactions

### Advanced Functionality

- Integrated chat for team communication
- Analytics dashboard with task metrics
- Offline support with optimistic UI updates
- Calendar integration with email reminders
- _Goal_: Extend beyond basic kanban with powerful team features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Links

- [Live Demo](#) (Add your live demo link here)
