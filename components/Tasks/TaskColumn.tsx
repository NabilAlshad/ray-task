import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskColumnDragData, TaskColumnProps } from "@/types";
import { TaskCard } from "@/components/ui/compound/TaskCard";
import { cn } from "@/lib/utils/helpers";
import { TASK_COLUMN_STYLES } from "./constants";

import { memo } from "react";

export const TaskColumn = memo(function TaskColumn({
  status,
  tasks,
  title,
  onViewTask,
  onEditTask,
  onDeleteTask,
  canEditTask,
  canDeleteTask,
  canMoveTask,
}: TaskColumnProps) {
  const droppableData: TaskColumnDragData = {
    type: "Column",
    status,
  };

  const columnStyle = TASK_COLUMN_STYLES[status];

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
        isOver && columnStyle.active,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full shadow-sm",
            columnStyle.badge,
          )}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col flex-1 h-full">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task, index) => (
            <TaskCard
              key={`${task.id}-${task.status}-${task.order}-${index}`}
              task={task}
              onView={onViewTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              canEdit={canEditTask}
              canDelete={canDeleteTask}
              canDrag={canMoveTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});
