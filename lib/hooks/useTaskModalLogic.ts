import { useState, useCallback } from "react";
import {
  canCreateTask,
  canDeleteTask,
  canUpdateTask,
  type Task,
  type TaskDraft,
} from "@/types";
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { socket } from "@/lib/socket";
import { TASK_STATUS_LABELS } from "@/types";

export function useTaskModalLogic() {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const tasks = useTaskStore(state => state.tasks);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const currentUser = useCurrentUserStore((state) => state.currentUser);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const role = currentUser?.role ?? "VIEWER";

  const handleOpenAddModal = useCallback(() => {
    if (!canCreateTask(role)) {
      addNotification({
        title: "Read-only access",
        message: "Your current role does not allow creating tasks.",
        variant: "warning",
      });
      return;
    }
    setTaskToEdit(null);
    setIsModalOpen(true);
  }, [addNotification, role]);

  const handleOpenEditModal = useCallback((task: Task) => {
    if (!canUpdateTask(role)) {
      addNotification({
        title: "Read-only access",
        message: "Your current role does not allow editing tasks.",
        variant: "warning",
      });
      return;
    }
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, [addNotification, role]);

  const handleSubmitModal = useCallback((data: TaskDraft) => {
    if (taskToEdit) {
      if (!canUpdateTask(role)) {
        addNotification({
          title: "Update blocked",
          message: "Your current role does not allow editing tasks.",
          variant: "warning",
        });
        return;
      }
      const updated = { ...taskToEdit, ...data };
      updateTask(updated.id, updated);
      socket.emit('taskUpdated', updated);
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
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        title: data.title,
        description: data.description,
        status: data.status,
        order: tasks.filter(t => t.status === data.status).length,
      };
      addTask(newTask);
      socket.emit('taskAdded', newTask);
      addNotification({
        title: "Task created",
        message: `"${newTask.title}" was added to ${TASK_STATUS_LABELS[newTask.status]}.`,
        variant: "success",
      });
    }
  }, [taskToEdit, updateTask, addTask, tasks, addNotification, role]);

  const handleRequestDeleteTask = useCallback((task: Task) => {
    if (!canDeleteTask(role)) {
      addNotification({
        title: "Delete blocked",
        message: "Only admins can delete tasks in this board.",
        variant: "warning",
      });
      return;
    }
    setTaskToDelete(task);
  }, [addNotification, role]);

  const handleCloseDeleteModal = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  const handleConfirmDeleteTask = useCallback(() => {
    if (!taskToDelete) return;
    if (!canDeleteTask(role)) {
      addNotification({
        title: "Delete blocked",
        message: "Only admins can delete tasks in this board.",
        variant: "warning",
      });
      setTaskToDelete(null);
      return;
    }

    deleteTask(taskToDelete.id);
    socket.emit('taskDeleted', taskToDelete.id);
    addNotification({
      title: "Task deleted",
      message: `"${taskToDelete.title}" was removed from the board.`,
      variant: "danger",
    });
    setTaskToDelete(null);
  }, [taskToDelete, deleteTask, addNotification, role]);

  return {
    isModalOpen,
    setIsModalOpen,
    taskToEdit,
    taskToDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSubmitModal,
    handleRequestDeleteTask,
    handleConfirmDeleteTask,
    handleCloseDeleteModal,
  };
}
