export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
};

export type TaskDraft = Pick<Task, "title" | "description" | "status">;

export type TaskMovePayload = Pick<Task, "id" | "status" | "order">;

export type TaskOptimisticAction =
  | { type: "add"; task: Task }
  | { type: "update"; task: Task }
  | { type: "delete"; id: Task["id"] }
  | { type: "move"; payload: TaskMovePayload };

export type TaskColumnDefinition = {
  id: TaskStatus;
  title: string;
};

export type TaskDragItemData = {
  type: "Task";
  task: Task;
};

export type TaskColumnDragData = {
  type: "Column";
  status: TaskStatus;
};

export type TaskDragData = TaskDragItemData | TaskColumnDragData;
