import type { Task } from "@/types";

export const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Write docs",
    description: "Document the board",
    status: "TODO",
    order: 0,
  },
  {
    id: "task-2",
    title: "Ship release",
    description: "Prepare production release",
    status: "DONE",
    order: 0,
  },
];
