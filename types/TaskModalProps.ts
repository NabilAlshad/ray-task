import type { Task, TaskDraft } from "./Task";

export type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskDraft) => void;
  taskToEdit?: Task | null;
};
