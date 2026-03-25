'use client';

import { TaskCardComponentProps, TaskColumnStatus } from '@/types';

const STATUS_ORDER: TaskColumnStatus[] = ['To Do', 'In Progress', 'Done'];

const statusStyles: Record<TaskColumnStatus, { badge: string; dot: string }> = {
  'To Do': {
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  'In Progress': {
    badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
  Done: {
    badge: 'bg-green-500/10 text-green-300 border-green-500/30',
    dot: 'bg-green-400',
  },
};

export default function TaskCard({
  title,
  status,
  onMoveLeft,
  onMoveRight,
}: TaskCardComponentProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1;

  const { badge, dot } = statusStyles[status];

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-md backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Title */}
      <p className="flex-1 text-sm font-medium text-white">{title}</p>

      {/* Status badge */}
      <span
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {status}
      </span>

      {/* Move buttons */}
      <div className="flex gap-2">
        <button
          onClick={onMoveLeft}
          disabled={!canMoveLeft}
          title="Move Left"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          ←
        </button>
        <button
          onClick={onMoveRight}
          disabled={!canMoveRight}
          title="Move Right"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
        >
          →
        </button>
      </div>
    </div>
  );
}
