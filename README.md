# 🗂️ Real-Time Kanban Task Board

A collaborative, real-time Kanban board built with **Next.js 16**, **Socket.IO**, **Zustand**, and **dnd-kit**. Multiple users can add, move, update, and delete tasks simultaneously — all changes sync instantly across every connected browser tab.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [How It Works](#-how-it-works)
- [Socket Events Reference](#-socket-events-reference)
- [Available Scripts](#-available-scripts)
- [Dependencies Explained](#-dependencies-explained)

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.1 |
| Language | TypeScript | ^5 |
| UI Library | React | 19.2.4 |
| State Management | Zustand | ^5.0.12 |
| Real-Time | Socket.IO | ^4.8.3 |
| Drag & Drop | dnd-kit | ^6.3.1 |
| Styling | Tailwind CSS | ^4 |
| Icons | Lucide React | ^1.0.1 |
| Database | Local JSON file (`data/tasks.json`) | — |

---

## 📁 Project Structure

```
task/
├── server.js                   # Custom Node.js server (Next.js + Socket.IO)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
│
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Home page — renders the board
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── AddTaskForm.tsx          # Form to add a new task
│   ├── ClientWrapper.tsx        # Client-only boundary (prevents SSR hydration issues)
│   ├── TaskCard.tsx             # Individual task display card
│   ├── TaskSection.tsx          # A single Kanban column section
│   └── ui/                     # Shared UI components
│       ├── TaskBoard.tsx        # Main board — renders all columns + drag/drop logic
│       ├── TaskCard.tsx         # UI-level task card with drag handle
│       ├── TaskColumn.tsx       # Droppable column container
│       ├── TaskModal.tsx        # Modal for editing task details
│       └── LiveUsers.tsx        # Real-time presence indicator (who's online)
│
├── store/
│   └── useTaskStore.ts          # Zustand global state store for tasks
│
├── lib/
│   ├── socket.ts                # Socket.IO client singleton
│   └── utils.ts                 # Utility functions (e.g. cn for classnames)
│
├── types/
│   └── index.ts                 # All shared TypeScript interfaces and types
│
└── data/
    └── tasks.json               # JSON file used as a persistent local database
```

---

## ✅ Prerequisites

Make sure you have the following installed before proceeding:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| Node.js | v18.x or higher | `node -v` |
| npm | v9.x or higher | `npm -v` |

> **Note:** This project uses ES Modules (`"type": "module"` is implied by the import syntax in `server.js`). Node.js 18+ handles this natively.

---

## 📦 Installation

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd task
```

### Step 2 — Install Dependencies

```bash
npm install
```

This installs all packages listed under both `dependencies` and `devDependencies` in `package.json`.

### Step 3 — Create the Data Directory

The app uses a local JSON file as its database. Create it before first run:

```bash
mkdir -p data
```

> **You don't need to create `tasks.json` manually.** The server auto-generates it with default seed tasks on first startup if the file doesn't exist.

---

## 🌐 Environment Variables

This project uses a layered env setup:

`.env`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Shared safe defaults.

`.env.example`

```env
NEXT_PUBLIC_SITE_URL=YOUR_PUBLIC_SITE_URL
```

Committed reference template with placeholder-safe values.

`.env.local`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Personal local overrides. This file is gitignored.

`.env.development`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Committed development defaults.

`.env.production`

```env
NEXT_PUBLIC_SITE_URL=https://mock-task-board.example.com
```

Committed production defaults with a mocked non-secret URL for now.

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL the browser uses to connect to the Socket.IO server |

Next.js loads these by environment, with `.env.local` overriding the committed defaults on your machine.
The production URL above is a placeholder for now. Replace it with your real deployed domain when production is ready.

---

## 🚀 Running the App

### Development Mode

```bash
npm run dev
```

- Starts the **custom Node.js server** (`server.js`) with Next.js in development mode
- Hot-reloading is enabled for all React components
- Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Mode

```bash
# Step 1 — Build the Next.js app
npm run build

# Step 2 — Start the production server
npm start
```

- `npm run build` compiles and optimizes the Next.js frontend
- `npm start` runs `server.js` with `NODE_ENV=production`, disabling dev overlays and enabling optimized output

---

## ⚙️ How It Works

### Custom Server Architecture

This project does **not** use `next dev` or `next start` directly. Instead, it runs a custom Node.js HTTP server (`server.js`) that:

1. **Boots Next.js** via `app.prepare()` and hands all page requests to Next.js's `handle()` function
2. **Attaches Socket.IO** to the same HTTP server on the same port (`3000`) — no separate WebSocket port needed

```
Port 3000
├── HTTP requests  → Next.js handles (pages, API routes, static files)
└── WebSocket      → Socket.IO handles (real-time events)
```

### Data Persistence

- Tasks are stored in **`data/tasks.json`** — a plain JSON file acting as a lightweight database
- On startup, the server reads this file into memory (`currentTasks`)
- Every mutation (add, move, update, delete) **immediately writes** back to the file
- On first run (or if the file is empty), 6 default seed tasks are written automatically

### State Management Flow

```
User Action (drag, add, edit, delete)
        ↓
Zustand Store (useTaskStore) — updates local UI immediately
        ↓
Socket.IO Client (lib/socket.ts) — emits event to server
        ↓
server.js — updates currentTasks in memory + saves to tasks.json
        ↓
socket.broadcast.emit() — pushes event to ALL other connected clients
        ↓
Other clients' Zustand stores update — their UI re-renders
```

---

## 📡 Socket Events Reference

### Client → Server (emitted by the browser)

| Event | Payload | Description |
|-------|---------|-------------|
| `taskAdded` | `Task` object | A new task was created |
| `taskMoved` | `{ id, status, order }` | A task was dragged to a new column/position |
| `taskUpdated` | `Task` object | A task's details were edited |
| `taskDeleted` | `id: string` | A task was deleted |
| `userJoined` | `{ id, name, color }` | A new user opened the board |

### Server → Client (received by the browser)

| Event | Payload | Description |
|-------|---------|-------------|
| `initTasks` | `Task[]` | Full task list sent on first connection |
| `taskAdded` | `Task` object | Broadcast when another user adds a task |
| `taskMoved` | `{ id, status, order }` | Broadcast when another user moves a task |
| `taskUpdated` | `Task` object | Broadcast when another user edits a task |
| `taskDeleted` | `id: string` | Broadcast when another user deletes a task |
| `userJoined` | `{ id, name, color }` | Broadcast when another user joins |
| `userLeft` | `socket.id: string` | Broadcast when a user disconnects |

---

## 📜 Available Scripts

```bash
npm run dev     # Start development server (node server.js with hot reload)
npm run build   # Build the Next.js production bundle
npm start       # Start production server (NODE_ENV=production node server.js)
npm run lint    # Run ESLint on the codebase
```

---

## 📦 Dependencies Explained

### Runtime Dependencies

| Package | Purpose |
|---------|---------|
| `next` | The React framework powering all pages and routing |
| `react` / `react-dom` | Core React library |
| `socket.io` | WebSocket server — runs inside `server.js` |
| `socket.io-client` | WebSocket client — used in `lib/socket.ts` |
| `zustand` | Lightweight global state management for tasks |
| `@dnd-kit/core` | Drag-and-drop engine used for moving task cards |
| `@dnd-kit/sortable` | Sortable list abstraction built on dnd-kit/core |
| `@dnd-kit/utilities` | Utility helpers for dnd-kit transforms |
| `lucide-react` | Icon library (used for UI icons) |
| `clsx` | Utility for conditionally joining CSS class names |
| `tailwind-merge` | Merges conflicting Tailwind classes intelligently |

### Dev Dependencies

| Package | Purpose |
|---------|---------|
| `typescript` | TypeScript compiler |
| `tailwindcss` | Utility-first CSS framework |
| `@tailwindcss/postcss` | PostCSS plugin to process Tailwind in the build |
| `@types/node` | TypeScript types for Node.js APIs |
| `@types/react` | TypeScript types for React |
| `@types/react-dom` | TypeScript types for React DOM |
| `eslint` | JavaScript/TypeScript linter |
| `eslint-config-next` | ESLint rules recommended by Next.js |

---

## 🧠 Key Design Decisions

- **Single port for HTTP + WebSocket**: Socket.IO is attached to the same Node.js `http.Server` that Next.js uses, avoiding the need for a separate backend port or proxy.
- **`autoConnect: false` on client socket**: The socket in `lib/socket.ts` doesn't auto-connect on import. Components explicitly call `socket.connect()` inside `useEffect` to avoid SSR issues.
- **`ClientWrapper.tsx`**: Wraps the board in a client-only boundary to prevent Next.js SSR from attempting to render socket-dependent UI on the server.
- **In-memory + file DB**: `currentTasks` is always in memory for fast access. Every write syncs to `tasks.json` for persistence across server restarts.

---

> Built with ❤️ using Next.js, Socket.IO, Zustand, and dnd-kit.
