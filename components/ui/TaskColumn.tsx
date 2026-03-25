import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  title: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function TaskColumn({ status, tasks, title, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "Column",
      status,
    },
  });

  const taskIds = tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-gray-100/50 rounded-2xl w-full md:w-[350px] min-h-[500px] p-4 gap-4",
        isOver && "ring-2 ring-blue-400 bg-blue-50/50"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-700">{title}</h3>
        <span className="bg-white text-xs font-semibold px-2 py-1 rounded-full text-gray-500 shadow-sm">
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
}
