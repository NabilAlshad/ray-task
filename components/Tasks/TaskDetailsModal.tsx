import { Button } from "@/components/ui/atomic/Button";
import { Modal } from "@/components/ui/compound/Modal";
import { TASK_STATUS_LABELS, type Task } from "@/types";

type TaskDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
};

const STATUS_STYLES = {
  TODO: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  DONE: "bg-emerald-100 text-emerald-700",
} as const;

export function TaskDetailsModal({ isOpen, onClose, task }: TaskDetailsModalProps) {
  if (!task) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {task.description?.trim() ? task.description : "No description provided for this task yet."}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
