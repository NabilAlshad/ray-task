import type { Task } from "./Task";

export type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  canEdit: boolean;
  canDelete: boolean;
  canDrag: boolean;
};
