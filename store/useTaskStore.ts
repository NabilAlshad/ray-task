import { create } from 'zustand';
import { Task, TaskStatus, TaskStore } from '@/types';

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
    
    // Create updated task
    const updatedTask = { ...task, status: newStatus };
    
    // Sort remaining tasks in the destination column by order
    const columnTasks = updatedTasks
      .filter(t => t.status === newStatus)
      .sort((a, b) => a.order - b.order);
      
    // Insert into new order position
    columnTasks.splice(newOrder, 0, updatedTask);
    
    // Re-assign proper consecutive orders to all in the column
    columnTasks.forEach((t, index) => {
      t.order = index;
    });

    // We now replace all matching column tasks in our global list with the newly reordered ones
    // and push the updated task as well.
    const nonColumnTasks = updatedTasks.filter(t => t.status !== newStatus);
    
    return { tasks: [...nonColumnTasks, ...columnTasks] };
  }),

  setTasks: (tasks) => set({ tasks })
}));
