import { useEffect, useRef } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/useNotificationStore";
import { TASK_STATUS_LABELS, type Task, type TaskMovePayload } from "@/types";

export function useTaskSocket() {
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const tasksRef = useRef(tasks);
  const hasConnectedRef = useRef(false);
  const hadUnexpectedDisconnectRef = useRef(false);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      if (!hasConnectedRef.current) {
        hasConnectedRef.current = true;
        return;
      }

      if (!hadUnexpectedDisconnectRef.current) {
        return;
      }

      if (socket.recovered) {
        addNotification({
          title: "Connection restored",
          message: "Your session was recovered and missed updates were restored.",
          variant: "info",
        });
      } else {
        addNotification({
          title: "Reconnected",
          message: "The board reconnected and synced with the latest server state.",
          variant: "info",
        });
      }

      hadUnexpectedDisconnectRef.current = false;
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io client disconnect") {
        return;
      }

      hadUnexpectedDisconnectRef.current = true;
      addNotification({
        title: "Connection lost",
        message: "Trying to restore your session after an unexpected disconnect.",
        variant: "warning",
      });
    });

    socket.on('initTasks', (startupTasks: Task[]) => {
      setTasks(startupTasks);
    });

    socket.on('taskAdded', (newTask: Task) => {
      addTask(newTask);
      addNotification({
        title: "New task added",
        message: `"${newTask.title}" was added to ${TASK_STATUS_LABELS[newTask.status]}.`,
        variant: "success",
      });
    });

    socket.on('taskUpdated', (updatedTask: Task) => {
      updateTask(updatedTask.id, updatedTask);
      addNotification({
        title: "Task updated",
        message: `"${updatedTask.title}" was updated by a teammate.`,
        variant: "info",
      });
    });

    socket.on('taskMoved', (data: TaskMovePayload) => {
      moveTask(data.id, data.status, data.order);
    });

    socket.on('taskDeleted', (id: string) => {
      const deletedTask = tasksRef.current.find((task) => task.id === id);
      deleteTask(id);
      addNotification({
        title: "Task deleted",
        message: deletedTask
          ? `"${deletedTask.title}" was deleted by a teammate.`
          : "A task was deleted by a teammate.",
        variant: "danger",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off('initTasks');
      socket.off('taskAdded');
      socket.off('taskUpdated');
      socket.off('taskMoved');
      socket.off('taskDeleted');
      socket.disconnect();
    };
  }, [setTasks, addTask, updateTask, moveTask, deleteTask, addNotification]);
}
