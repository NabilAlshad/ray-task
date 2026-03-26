# Demo Speech Script: Real-Time Kanban Task Board (1.5-minute)

"Hi everyone, this is a quick Real-Time Kanban Task Board demo.

Implementation: Next.js frontend with Zustand for local state and dnd-kit for drag/drop. Main UI lives in `components/Tasks`, with task logic in `lib/hooks/tasks`. A custom Node server is used with `server/socketHandlers.js`, and `useTaskSocket` subscribes to and processes socket events.

Architecture: This repo uses an App Router page and a single-process server that hosts both Next.js and Socket.IO. We persist tasks in `data/tasks.json` for simplicity, and the client side will update in-memory local state immediately while keeping strong separation between UI, hooks, and stores.

Real-time: Clients emit events (`taskAdded`, `taskUpdated`, `taskMoved`, `taskDeleted`) to the server. The server applies permission checks, updates state, persists to JSON, and broadcasts updates to all peers. Optimistic updates make the UI feel instant and we reconcile with server state on incoming events.

Plus, live users are managed via Socket.IO with role-based permissions (admin/member/viewer), notifications, and reconnect recovery. The result is a collaborative board that syncs changes in real time for all users. Thank you."
