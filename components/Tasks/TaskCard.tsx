import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskCardProps, TaskDragItemData } from "@/types";
import { cn } from "@/lib/utils/helpers";
import { Edit2, Trash2 } from "lucide-react";

import { memo } from "react";

export const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  canDrag,
}: TaskCardProps) {
  const sortableData: TaskDragItemData = {
    type: "Task",
    task,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: sortableData,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white group relative rounded-xl shadow-sm border border-gray-200 p-4 mb-3 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-grab",
        isDragging && "opacity-50 border-blue-500 shadow-lg",
        !canDrag && "cursor-default",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-gray-800 line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
              aria-label={`Edit task ${task.title}`}
              title={`Edit task ${task.title}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : null}
          {canDelete ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors"
              aria-label={`Delete task ${task.title}`}
              title={`Delete task ${task.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-3">{task.description}</p>
      )}
    </div>
  );
});
