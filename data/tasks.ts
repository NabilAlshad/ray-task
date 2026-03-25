import type { Task } from "@/types";

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design the homepage layout",
    description: "Create wireframes and mockups",
    status: "IN_PROGRESS",
    order: 0,
  },
  {
    id: "2",
    title: "Build the TaskCard component",
    description: "Implement drag and drop functionality",
    status: "DONE",
    order: 0,
  },
  {
    id: "3",
    title: "Integrate API endpoints",
    description: "Connect frontend to backend",
    status: "IN_PROGRESS",
    order: 1,
  },
  {
    id: "4",
    title: "Write unit tests",
    description: "Ensure code quality",
    status: "TODO",
    order: 0,
  },
  {
    id: "5",
    title: "Deploy to production",
    description: "Set up hosting and domains",
    status: "TODO",
    order: 1,
  },
  {
    id: "6",
    title: "Set up CI/CD pipeline",
    description: "Automate testing and deployment",
    status: "DONE",
    order: 1,
  },
];
