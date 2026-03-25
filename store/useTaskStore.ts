import { create } from 'zustand';
import type { Task, TaskStore } from '@/types';
import {
  addTaskToList,
  deleteTaskFromList,
  moveTaskInList,
  updateTaskInList,
} from "@/lib/utils/taskState";

const INITIAL_TASKS: Task[] = [];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: INITIAL_TASKS,

  addTask: (task) => set((state) => ({
    tasks: addTaskToList(state.tasks, task)
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: updateTaskInList(state.tasks, id, updates)
  })),

  deleteTask: (id) => set((state) => ({
    tasks: deleteTaskFromList(state.tasks, id)
  })),

  moveTask: (id, newStatus, newOrder) => set((state) => {
    return {
      tasks: moveTaskInList(state.tasks, id, newStatus, newOrder),
    };
  }),

  setTasks: (tasks) => set({ tasks })
}));
