import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { applyTaskOptimisticAction } from "@/lib/utils/taskState";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { useTaskStore } from "@/store/useTaskStore";
import { socket } from "@/lib/socket";
import {
  canMoveTask,
  type Task,
  type TaskDragData,
  type TaskMovePayload,
  type TaskOptimisticAction,
  type TaskStatus,
} from "@/types";

type UseTaskDragLogicOptions = {
  tasks: Task[];
  addOptimisticTask: (action: TaskOptimisticAction) => void;
};

export function useTaskDragLogic({ tasks, addOptimisticTask }: UseTaskDragLogicOptions) {
  const { moveTask } = useTaskStore();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const role = currentUser?.role ?? "VIEWER";
  const hasMoveAccess = canMoveTask(role);

  const tasksRef = useRef<Task[]>(tasks);
  const baseTasksRef = useRef(tasks);

  useEffect(() => {
    baseTasksRef.current = tasks;

    if (!previewTasks) {
      tasksRef.current = tasks;
    }
  }, [tasks, previewTasks]);

  const resetPreview = useCallback(() => {
    setPreviewTasks(null);
    tasksRef.current = baseTasksRef.current;
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!hasMoveAccess) return;
    resetPreview();
    const { active } = event;
    const task = baseTasksRef.current.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }, [hasMoveAccess, resetPreview]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!hasMoveAccess) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current as TaskDragData | undefined;

    const activeTaskMatch = tasksRef.current.find((task) => task.id === activeId);
    if (!activeTaskMatch) return;

    let overStatus: TaskStatus;

    if (overData?.type === "Task") {
      const overTask = tasksRef.current.find((task) => task.id === overId);
      if (!overTask) return;
      overStatus = overTask.status;
    } else if (overData?.type === "Column") {
      overStatus = overData.status;
    } else {
      return;
    }

    if (activeTaskMatch.status !== overStatus) {
      const destColumnTasks = tasksRef.current
        .filter((task) => task.status === overStatus && task.id !== activeId)
        .sort((a, b) => a.order - b.order);

      let insertIndex = destColumnTasks.length;
      if (overData?.type === "Task") {
        const overTask = tasksRef.current.find((task) => task.id === overId);
        if (overTask) {
          insertIndex = destColumnTasks.findIndex((task) => task.id === overId);
          if (insertIndex === -1) insertIndex = destColumnTasks.length;
        }
      }

      const nextPreviewTasks = applyTaskOptimisticAction(tasksRef.current, {
        type: "move",
        payload: {
          id: activeId,
          status: overStatus,
          order: insertIndex,
        },
      });

      tasksRef.current = nextPreviewTasks;
      setPreviewTasks(nextPreviewTasks);
    }
  }, [hasMoveAccess]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!hasMoveAccess) {
      resetPreview();
      setActiveTask(null);
      return;
    }
    setActiveTask(null);
    const { active, over } = event;

    if (!over) {
      resetPreview();
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current as TaskDragData | undefined;

    const currentTasks = tasksRef.current;
    const activeTaskMatch = currentTasks.find((task) => task.id === activeId);
    if (!activeTaskMatch) return;

    if (overData?.type === "Task" && activeId !== overId) {
      const overTask = currentTasks.find((task) => task.id === overId);

      if (overTask && activeTaskMatch.status === overTask.status) {
        const columnTasks = currentTasks
          .filter((task) => task.status === activeTaskMatch.status)
          .sort((a, b) => a.order - b.order);

        const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
        const newIndex = columnTasks.findIndex((task) => task.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const movedTask: TaskMovePayload = {
            id: activeId,
            status: activeTaskMatch.status,
            order: newIndex,
          };

          addOptimisticTask({ type: "move", payload: movedTask });
          startTransition(() => {
            moveTask(movedTask.id, movedTask.status, movedTask.order);
            socket.emit('taskMoved', movedTask);
          });
          resetPreview();
          return;
        }
      }
    }

    const finalTask = currentTasks.find((task) => task.id === activeId);
    if (finalTask) {
      const movedTask: TaskMovePayload = {
        id: activeId,
        status: finalTask.status,
        order: finalTask.order,
      };

      addOptimisticTask({ type: "move", payload: movedTask });
      startTransition(() => {
        moveTask(movedTask.id, movedTask.status, movedTask.order);
        socket.emit('taskMoved', movedTask);
      });
    }

    resetPreview();
  }, [addOptimisticTask, hasMoveAccess, moveTask, resetPreview]);

  return {
    activeTask,
    previewTasks,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
