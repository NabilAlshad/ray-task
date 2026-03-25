'use client';

import { useState } from 'react';
import { AddTaskFormProps } from '@/types';

export default function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 backdrop-blur-sm"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter a new task…"
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        + Add Task
      </button>
    </form>
  );
}
