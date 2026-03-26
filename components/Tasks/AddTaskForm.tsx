'use client';

import { useState } from 'react';
import { AddTaskFormProps } from '@/types';
import { Input } from '@/components/ui/atomic/Input';
import { Button } from '@/components/ui/atomic/Button';

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
      aria-label="Add task form"
      className="flex gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-5 py-4 backdrop-blur-sm"
    >
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Task title"
        placeholder="Enter a new task…"
        className="flex-1 bg-white/5 text-white placeholder:text-white/30 border-white/10 focus-visible:ring-blue-400/30"
      />
      <Button
        type="submit"
        disabled={!value.trim()}
        aria-label="Add Task"
        className="shrink-0"
      >
        + Add Task
      </Button>
    </form>
  );
}
