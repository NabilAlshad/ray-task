import { startTransition, useCallback, useMemo, useState } from "react";
import {
  canCreateTask,
  canDeleteTask,
  canUpdateTask,
  type TaskOptimisticAction,
  type Task,
  type TaskDraft,
} from "@/types";
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { socket } from "@/lib/socket";
import { TASK_STATUS_LABELS } from "@/types";

type UseTaskModalLogicOptions = {
  tasks: Task[];
  addOptimisticTask: (action: TaskOptimisticAction) => void;
};

function generateUniqueTaskId(existingIds: Set<string>) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    let id = crypto.randomUUID();
    while (existingIds.has(id)) {
      id = crypto.randomUUID();
    }
    return id;
  }

  let id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  while (existingIds.has(id)) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}`;
  }
  return id;
}

export function useTaskModalLogic({
  tasks,
  addOptimisticTask,
}: UseTaskModalLogicOptions) {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const currentUser = useCurrentUserStore((state) => state.currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEditId, setTaskToEditId] = useState<Task["id"] | null>(null);
  const [taskToViewId, setTaskToViewId] = useState<Task["id"] | null>(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState<Task["id"] | null>(null);
  const role = currentUser?.role ?? "VIEWER";

  const taskToEdit = useMemo(
    () => tasks.find((task) => task.id === taskToEditId) ?? null,
    [taskToEditId, tasks],
  );
  const taskToView = useMemo(
    () => tasks.find((task) => task.id === taskToViewId) ?? null,
    [taskToViewId, tasks],
  );
  const taskToDelete = useMemo(
    () => tasks.find((task) => task.id === taskToDeleteId) ?? null,
    [taskToDeleteId, tasks],
  );
  const isTaskModalOpen = isModalOpen && (!taskToEditId || Boolean(taskToEdit));

  const handleOpenAddModal = useCallback(() => {
    if (!canCreateTask(role)) {
      addNotification({
        title: "Read-only access",
        message: "Your current role does not allow creating tasks.",
        variant: "warning",
      });
      return;
    }
    setTaskToEditId(null);
    setIsModalOpen(true);
  }, [addNotification, role]);

  const handleOpenViewModal = useCallback((task: Task) => {
    setTaskToViewId(task.id);
  }, []);

  const handleCloseViewModal = useCallback(() => {
    setTaskToViewId(null);
  }, []);

  const handleOpenEditModal = useCallback(
    (task: Task) => {
      if (!canUpdateTask(role)) {
        addNotification({
          title: "Read-only access",
          message: "Your current role does not allow editing tasks.",
          variant: "warning",
        });
        return;
      }
      setTaskToViewId(null);
      setTaskToEditId(task.id);
      setIsModalOpen(true);
    },
    [addNotification, role],
  );

  const handleSubmitModal = useCallback(
    (data: TaskDraft) => {
      const normalizeTitleForComparison = (title: string) =>
        title.trim().toLowerCase().replace(/\s+/g, " ");

      if (taskToEdit) {
        if (!canUpdateTask(role)) {
          addNotification({
            title: "Update blocked",
            message: "Your current rsole does not allow editing tasks.",
            variant: "warning",
          });
          return;
        }
        const newTitleNormalized = normalizeTitleForComparison(data.title);
        const duplicateTask = tasks.find(
          (task) =>
            task.id !== taskToEdit.id &&
            normalizeTitleForComparison(task.title) === newTitleNormalized,
        );

        if (duplicateTask) {
          addNotification({
            title: "Duplicate title",
            message: `A task with the title "${data.title}" already exists.`,
            variant: "warning",
          });
          return;
        }
        const updated = { ...taskToEdit, ...data };
        startTransition(() => {
          addOptimisticTask({ type: "update", task: updated });
          updateTask(updated.id, updated);
          socket.emit("taskUpdated", updated);
        });
        addNotification({
          title: "Task updated",
          message: `"${updated.title}" was updated.`,
          variant: "info",
        });
      } else {
        if (!canCreateTask(role)) {
          addNotification({
            title: "Create blocked",
            message: "Your current role does not allow creating tasks.",
            variant: "warning",
          });
          return;
        }
        const newTitleNormalized = normalizeTitleForComparison(data.title);
        const duplicateTask = tasks.find(
          (task) =>
            normalizeTitleForComparison(task.title) === newTitleNormalized,
        );

        if (duplicateTask) {
          addNotification({
            title: "Duplicate title",
            message: `A task with the title "${data.title}" already exists.`,
            variant: "warning",
          });
          return;
        }
        const existingIds = new Set(tasks.map((task) => task.id));
        const newTask: Task = {
          id: generateUniqueTaskId(existingIds),
          title: data.title,
          description: data.description,
          status: data.status,
          order: tasks.filter((task) => task.status === data.status).length,
        };
        startTransition(() => {
          addOptimisticTask({ type: "add", task: newTask });
          addTask(newTask);
          socket.emit("taskAdded", newTask);
        });
        addNotification({
          title: "Task created",
          message: `"${newTask.title}" was added to ${TASK_STATUS_LABELS[newTask.status]}.`,
          variant: "success",
        });
      }
    },
    [
      taskToEdit,
      updateTask,
      addTask,
      tasks,
      addNotification,
      role,
      addOptimisticTask,
    ],
  );

  const handleRequestDeleteTask = useCallback(
    (task: Task) => {
      if (!canDeleteTask(role)) {
        addNotification({
          title: "Delete blocked",
          message: "Only admins can delete tasks in this board.",
          variant: "warning",
        });
        return;
      }
      setTaskToDeleteId(task.id);
    },
    [addNotification, role],
  );

  const handleCloseDeleteModal = useCallback(() => {
    setTaskToDeleteId(null);
  }, []);

  const handleConfirmDeleteTask = useCallback(() => {
    if (!taskToDelete) return;
    if (!canDeleteTask(role)) {
      addNotification({
        title: "Delete blocked",
        message: "Only admins can delete tasks in this board.",
        variant: "warning",
      });
      setTaskToDeleteId(null);
      return;
    }

    startTransition(() => {
      addOptimisticTask({ type: "delete", id: taskToDelete.id });
      deleteTask(taskToDelete.id);
      socket.emit("taskDeleted", taskToDelete.id);
    });
    addNotification({
      title: "Task deleted",
      message: `"${taskToDelete.title}" was removed from the board.`,
      variant: "danger",
    });
    setTaskToDeleteId(null);
    setTaskToViewId((currentId) =>
      currentId === taskToDelete.id ? null : currentId,
    );
  }, [taskToDelete, deleteTask, addNotification, role, addOptimisticTask]);

  return {
    isModalOpen,
    isTaskModalOpen,
    setIsModalOpen,
    taskToEdit,
    taskToView,
    taskToDelete,
    handleOpenAddModal,
    handleOpenViewModal,
    handleCloseViewModal,
    handleOpenEditModal,
    handleSubmitModal,
    handleRequestDeleteTask,
    handleConfirmDeleteTask,
    handleCloseDeleteModal,
  };
}
