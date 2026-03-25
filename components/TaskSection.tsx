'use client';

import TaskCard from '@/components/TaskCard';
import AddTaskForm from '@/components/AddTaskForm';
import { TaskSectionProps, TaskColumnStatus } from '@/types';

const sectionStyles: Record<TaskColumnStatus, { heading: string; border: string }> = {
  'To Do': { heading: 'text-blue-400', border: 'border-blue-500/20' },
  'In Progress': { heading: 'text-yellow-400', border: 'border-yellow-500/20' },
  Done: { heading: 'text-green-400', border: 'border-green-500/20' },
};

export default function TaskSection({
  status,
  tasks,
  onMoveLeft,
  onMoveRight,
  onAddTask,
}: TaskSectionProps) {
  const { heading, border } = sectionStyles[status];

  return (
    <div className={`rounded-2xl border ${border} bg-white/[0.03] p-4`}>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className={`text-sm font-semibold uppercase tracking-widest ${heading}`}>
          {status}
        </h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
          {tasks.length}
        </span>
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            status={task.status}
            onMoveLeft={() => onMoveLeft(task.id)}
            onMoveRight={() => onMoveRight(task.id)}
          />
        ))}

        {tasks.length === 0 && !onAddTask && (
          <p className="py-3 text-center text-xs text-white/20">No tasks here</p>
        )}
      </div>

      {/* Add Task form — only for "To Do" */}
      {onAddTask && (
        <div className="mt-4">
          <AddTaskForm onAdd={onAddTask} />
        </div>
      )}
    </div>
  );
}
