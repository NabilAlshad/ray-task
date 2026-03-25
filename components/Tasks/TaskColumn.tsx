import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { TaskColumnDragData, TaskColumnProps } from "@/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils/helpers";

import { memo } from "react";

const COLUMN_STYLES = {
  TODO: {
    container: "bg-amber-50/80 border border-amber-200/70",
    active: "ring-2 ring-amber-400 bg-amber-100/70",
    badge: "bg-amber-100 text-amber-700",
  },
  IN_PROGRESS: {
    container: "bg-sky-50/80 border border-sky-200/70",
    active: "ring-2 ring-sky-400 bg-sky-100/70",
    badge: "bg-sky-100 text-sky-700",
  },
  DONE: {
    container: "bg-emerald-50/80 border border-emerald-200/70",
    active: "ring-2 ring-emerald-400 bg-emerald-100/70",
    badge: "bg-emerald-100 text-emerald-700",
  },
} as const;

export const TaskColumn = memo(function TaskColumn({ status, tasks, title, onEditTask, onDeleteTask }: TaskColumnProps) {
  const droppableData: TaskColumnDragData = {
    type: "Column",
    status,
  };

  const columnStyle = COLUMN_STYLES[status];

  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: droppableData,
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl w-full md:w-[350px] min-h-[500px] p-4 gap-4 transition-colors",
        columnStyle.container,
        isOver && columnStyle.active
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full shadow-sm", columnStyle.badge)}>
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col flex-1 h-full">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEdit={onEditTask} 
              onDelete={onDeleteTask} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});
