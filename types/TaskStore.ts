import type { Task, TaskMovePayload } from "./Task";

export type TaskStore = {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: Task["id"], updates: Partial<Task>) => void;
  deleteTask: (id: Task["id"]) => void;
  moveTask: (
    id: TaskMovePayload["id"],
    newStatus: TaskMovePayload["status"],
    newOrder: TaskMovePayload["order"]
  ) => void;
  setTasks: (tasks: Task[]) => void;
};
