// ─── Domain Types ────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────

/** Status labels used in the UI columns */
export type TaskColumnStatus = 'To Do' | 'In Progress' | 'Done';

/** Props for a single task card */
export interface TaskCardProps {
  title: string;
  status: TaskColumnStatus;
}

/** Props for the TaskCard component (includes navigation callbacks) */
export interface TaskCardComponentProps extends TaskCardProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

/** Props for a Kanban column section */
export interface TaskSectionProps {
  status: TaskColumnStatus;
  tasks: (TaskCardProps & { id: number })[];
  onMoveLeft: (id: number) => void;
  onMoveRight: (id: number) => void;
  /** Only provided for the "To Do" column */
  onAddTask?: (title: string) => void;
}

/** Props for the add-task form */
export interface AddTaskFormProps {
  onAdd: (title: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

/** Shape of the Zustand task store */
export interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus, newOrder: number) => void;
  setTasks: (tasks: Task[]) => void;
}
