import { useState } from "react";
import type { TaskModalProps } from "@/types";
import { Input } from "@/components/ui/atomic/Input";
import { Textarea } from "@/components/ui/atomic/Textarea";
import { Button } from "@/components/ui/atomic/Button";
import { Modal } from "@/components/ui/template/Modal";

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
}: TaskModalProps) {
  const [title, setTitle] = useState(taskToEdit?.title ?? "");
  const [description, setDescription] = useState(taskToEdit?.description ?? "");
  const titleInputId = "task-title";
  const descriptionInputId = "task-description";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      status: taskToEdit ? taskToEdit.status : "TODO",
    });
    setTitle("");
    setDescription("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor={titleInputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <Input
            id={titleInputId}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
            placeholder="e.g., Update documentation"
            autoFocus
            required
          />
        </div>

        <div>
          <label
            htmlFor={descriptionInputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description (optional)
          </label>
          <Textarea
            id={descriptionInputId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Description (optional)"
            placeholder="Add more details..."
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim()}
            aria-label={taskToEdit ? "Save Changes" : "Create Task"}
          >
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
