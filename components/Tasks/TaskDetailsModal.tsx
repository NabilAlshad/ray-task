import { Button } from "@/components/ui/atomic/Button";
import { Modal } from "@/components/ui/template/Modal";
import { TASK_STATUS_LABELS, type Task } from "@/types";
import { TASK_DETAILS_STATUS_STYLES } from "./constants";

type TaskDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
};

export function TaskDetailsModal({
  isOpen,
  onClose,
  task,
}: TaskDetailsModalProps) {
  if (!task) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TASK_DETAILS_STATUS_STYLES[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
              {task.description?.trim()
                ? task.description
                : "No description provided for this task yet."}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
