import { useEffect, useRef } from "react";
import { useTaskStore } from "@/store/useTaskStore";
import { socket } from "@/lib/socket";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import {
  TASK_STATUS_LABELS,
  USER_ROLE_LABELS,
  type Task,
  type TaskMovePayload,
  type User,
} from "@/types";

export function useTaskSocket() {
  const tasks = useTaskStore((state) => state.tasks);
  const setTasks = useTaskStore((state) => state.setTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const setCurrentUser = useCurrentUserStore((state) => state.setCurrentUser);
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
          message:
            "Your session was recovered and missed updates were restored.",
          variant: "info",
        });
      } else {
        addNotification({
          title: "Reconnected",
          message:
            "The board reconnected and synced with the latest server state.",
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
        message:
          "Trying to restore your session after an unexpected disconnect.",
        variant: "warning",
      });
    });

    socket.on("initTasks", (startupTasks: Task[]) => {
      setTasks(startupTasks);
    });

    socket.on("currentUser", (user: User) => {
      setCurrentUser(user);
      addNotification({
        title: "Welcome back!",
        message: `You are signed in as ${user.name} with ${USER_ROLE_LABELS[user.role]} access.`,
        variant: "info",
      });
    });

    socket.on("taskAdded", (newTask: Task) => {
      addTask(newTask);
      addNotification({
        title: "New task added",
        message: `"${newTask.title}" was added to ${TASK_STATUS_LABELS[newTask.status]}.`,
        variant: "success",
      });
    });

    socket.on("taskUpdated", (updatedTask: Task) => {
      updateTask(updatedTask.id, updatedTask);
      addNotification({
        title: "Task updated",
        message: `"${updatedTask.title}" was updated by a teammate.`,
        variant: "info",
      });
    });

    socket.on("taskMoved", (data: TaskMovePayload) => {
      moveTask(data.id, data.status, data.order);
    });

    socket.on("taskDeleted", (id: string) => {
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

    socket.on(
      "permissionDenied",
      (payload: { action: string; role: User["role"] }) => {
        const actionLabel =
          payload.action === "delete"
            ? "delete tasks"
            : payload.action === "move"
              ? "move tasks"
              : payload.action === "update"
                ? "edit tasks"
                : "create tasks";

        addNotification({
          title: "Permission denied",
          message: `${USER_ROLE_LABELS[payload.role]} users cannot ${actionLabel}.`,
          variant: "warning",
        });
      },
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("initTasks");
      socket.off("currentUser");
      socket.off("taskAdded");
      socket.off("taskUpdated");
      socket.off("taskMoved");
      socket.off("taskDeleted");
      socket.off("permissionDenied");
      socket.disconnect();
    };
  }, [
    setTasks,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    addNotification,
    setCurrentUser,
  ]);
}
