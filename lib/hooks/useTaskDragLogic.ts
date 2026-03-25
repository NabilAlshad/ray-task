import { useState, useCallback, useRef, useEffect } from "react";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTaskStore } from "@/store/useTaskStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { socket } from "@/lib/socket";
import { canMoveTask, type Task, type TaskDragData, type TaskMovePayload, type TaskStatus } from "@/types";

export function useTaskDragLogic() {
  const { tasks, moveTask } = useTaskStore();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const role = currentUser?.role ?? "VIEWER";
  const hasMoveAccess = canMoveTask(role);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!hasMoveAccess) return;
    const { active } = event;
    const task = tasksRef.current.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }, [hasMoveAccess]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!hasMoveAccess) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current as TaskDragData | undefined;

    const activeTask = tasksRef.current.find(t => t.id === activeId);
    if (!activeTask) return;

    let overStatus: TaskStatus;

    if (overData?.type === "Task") {
      const overTask = tasksRef.current.find(t => t.id === overId);
      if (!overTask) return;
      overStatus = overTask.status;
    } else if (overData?.type === "Column") {
      overStatus = overData.status;
    } else {
      return;
    }

    if (activeTask.status !== overStatus) {
      const destColumnTasks = tasksRef.current
        .filter(t => t.status === overStatus && t.id !== activeId)
        .sort((a, b) => a.order - b.order);

      let insertIndex = destColumnTasks.length;
      if (overData?.type === "Task") {
        const overTask = tasksRef.current.find(t => t.id === overId);
        if (overTask) {
          insertIndex = destColumnTasks.findIndex(t => t.id === overId);
          if (insertIndex === -1) insertIndex = destColumnTasks.length;
        }
      }

      moveTask(activeId, overStatus, insertIndex);
    }
  }, [hasMoveAccess, moveTask]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (!hasMoveAccess) {
      setActiveTask(null);
      return;
    }
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data.current as TaskDragData | undefined;

    const currentTasks = tasksRef.current;
    const activeTaskMatch = currentTasks.find(t => t.id === activeId);
    if (!activeTaskMatch) return;

    if (overData?.type === "Task" && activeId !== overId) {
      const overTask = currentTasks.find(t => t.id === overId);
      if (overTask && activeTaskMatch.status === overTask.status) {
        const colTasks = currentTasks
          .filter(t => t.status === activeTaskMatch.status)
          .sort((a, b) => a.order - b.order);

        const oldIndex = colTasks.findIndex(t => t.id === activeId);
        const newIndex = colTasks.findIndex(t => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(colTasks, oldIndex, newIndex);
          reordered.forEach((t, i) => {
            if (t.order !== i) moveTask(t.id, t.status, i);
          });

          const movedTask: TaskMovePayload = {
            id: activeId,
            status: activeTaskMatch.status,
            order: newIndex,
          };

          socket.emit('taskMoved', movedTask);
          return;
        }
      }
    }

    const finalTask = tasksRef.current.find(t => t.id === activeId);
    if (finalTask) {
      const movedTask: TaskMovePayload = {
        id: activeId,
        status: finalTask.status,
        order: finalTask.order,
      };

      socket.emit('taskMoved', movedTask);
    }
  }, [hasMoveAccess, moveTask]);

  return {
    activeTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
