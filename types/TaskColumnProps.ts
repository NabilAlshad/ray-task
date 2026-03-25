import type { Task, TaskStatus } from "./Task";

export type TaskColumnProps = {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canMoveTask: boolean;
};
