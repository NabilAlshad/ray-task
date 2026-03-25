import { useState, useCallback } from "react";
import type { Task, TaskDraft } from "@/types";
import { useTaskStore } from "@/store/useTaskStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { socket } from "@/lib/socket";
import { TASK_STATUS_LABELS } from "@/types";

export function useTaskModalLogic() {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const tasks = useTaskStore(state => state.tasks);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleOpenAddModal = useCallback(() => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  }, []);

  const handleSubmitModal = useCallback((data: TaskDraft) => {
    if (taskToEdit) {
      const updated = { ...taskToEdit, ...data };
      updateTask(updated.id, updated);
      socket.emit('taskUpdated', updated);
      addNotification({
        title: "Task updated",
        message: `"${updated.title}" was updated.`,
        variant: "info",
      });
    } else {
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
  }, [taskToEdit, updateTask, addTask, tasks, addNotification]);

  const handleRequestDeleteTask = useCallback((task: Task) => {
    setTaskToDelete(task);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  const handleConfirmDeleteTask = useCallback(() => {
    if (!taskToDelete) return;

    deleteTask(taskToDelete.id);
    socket.emit('taskDeleted', taskToDelete.id);
    addNotification({
      title: "Task deleted",
      message: `"${taskToDelete.title}" was removed from the board.`,
      variant: "danger",
    });
    setTaskToDelete(null);
  }, [taskToDelete, deleteTask, addNotification]);

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
