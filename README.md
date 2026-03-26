# Real-Time Kanban Task Board

## Installation

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
git clone <your-repo-url>
cd task
npm install
mkdir -p data
```

The server will create `data/tasks.json` with seed tasks on first run if it does not already exist.

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production

```bash
npm run build
npm start
```

A small collaborative Kanban board built with Next.js, Socket.IO, Zustand, and dnd-kit. Multiple users can open the same board and see task changes update in real time.

## Architecture and Folder Structure

This app uses a custom Node server instead of running plain `next dev` or `next start`. The same HTTP server handles both the Next.js app and the Socket.IO connection.

```text
.
├── app/                    # Next.js App Router entrypoints and global styles
├── components/             # Board UI, modals, notifications, live user UI
│   ├── live-users/         # User management components
│   └── Tasks/              # Task board components
├── lib/
│   ├── hooks/              # Socket, drag/drop, and modal behavior
│   │   ├── live-users/     # Live user hooks
│   │   └── tasks/          # Task-related hooks
│   ├── socket.ts           # Socket.IO client singleton
│   └── utils/              # Shared helpers/constants
├── store/                  # Zustand stores for tasks, user, notifications
├── types/                  # Shared TypeScript types
├── data/                   # Local JSON persistence
├── server/                 # Server-side logic
│   ├── server.js           # Custom Node + Next + Socket.IO server
│   ├── socketHandlers.js   # Socket event handlers
│   ├── tasksStore.js       # Task persistence logic
│   └── usersDirectoryStore.js # User directory management
├── public/                 # Static assets
├── test-utils/             # Test utilities
├── __tests__/              # Component and app tests
└── tsconfig.json, jest.config.ts, etc. # Config files
```

Architecture summary:

- `server/server.js` boots Next.js, attaches Socket.IO, keeps the current task list in memory, and writes changes to `data/tasks.json`.
- `app/page.tsx` renders the main page with the live users bar and task board.
- `components/Tasks/*` contains the board UI and task interactions.
- `lib/hooks/*` keeps socket, drag/drop, and modal logic separate from presentational components.
- Zustand stores hold client-side task state, current user state, and notifications.

## State Management Approach

The client uses Zustand for lightweight shared state.

- `useTaskStore` holds the board tasks and exposes `setTasks`, `addTask`, `updateTask`, `moveTask`, and `deleteTask`.
- `useCurrentUserStore` holds the current connected user and assigned role.
- `useNotificationStore` holds transient UI notifications.

Approach:

- The acting user updates local state immediately for a responsive UI.
- Socket events are then sent to the server.
- Other connected clients receive those events and update their own Zustand state.
- On initial connection, the server sends the full task list so the client can hydrate from the current source of truth.

## Real-Time Implementation Approach

Real-time sync is implemented with Socket.IO over the same server process as Next.js.

Flow:

1. A browser connects to Socket.IO and joins the shared board room.
2. The server sends initial board state and active user information.
3. When a user adds, edits, moves, or deletes a task, the client emits a socket event.
4. The server validates permissions, updates in-memory state, persists to `data/tasks.json`, and emits the change to the rest of the room.
5. Other clients apply the incoming event to their local Zustand store and re-render.

Current event set:

- `taskAdded`
- `taskUpdated`
- `taskMoved`
- `taskDeleted`
- `userJoined`
- `userLeft`
- `initTasks`
- `activeUsers`
- `currentUser`
- `permissionDenied`

The server also enables Socket.IO connection state recovery, which helps restore missed events after brief disconnects.

## Trade-Offs and Assumptions

### Trade-Offs

- A JSON file is simple and easy to inspect, but it is not suitable for high write volume, concurrent multi-process writes, or production-scale collaboration.
- Keeping board state in server memory makes updates fast, but it assumes a single server instance.
- Optimistic client updates improve responsiveness, but simultaneous edits use a simple last-write-wins model.
- A custom server makes real-time setup straightforward, but it is less portable than a purely serverless Next.js deployment.

### Assumptions

- There is currently one shared board room for all connected users.
- The app is intended for local/demo or small-team usage rather than large-scale production traffic.
- Permissions are role-based and enforced on the server for create, move, update, and delete actions.
- `NEXT_PUBLIC_SITE_URL` points to the same server that hosts both the web app and Socket.IO.
