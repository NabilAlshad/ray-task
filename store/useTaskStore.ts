import { create } from 'zustand';
import type { Task, TaskStore } from '@/types';

const INITIAL_TASKS: Task[] = [];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: INITIAL_TASKS,

  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => (t.id === id ? { ...t, ...updates } : t))
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  moveTask: (id, newStatus, newOrder) => set((state) => {
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return state;

    const updatedTasks = [...state.tasks];
    const [task] = updatedTasks.splice(taskIndex, 1);

    const updatedTask = { ...task, status: newStatus };

    const columnTasks = updatedTasks
      .filter(t => t.status === newStatus)
      .sort((a, b) => a.order - b.order);

    columnTasks.splice(newOrder, 0, updatedTask);

    columnTasks.forEach((t, index) => {
      t.order = index;
    });

    const nonColumnTasks = updatedTasks.filter(t => t.status !== newStatus);

    return { tasks: [...nonColumnTasks, ...columnTasks] };
  }),

  setTasks: (tasks) => set({ tasks })
}));
