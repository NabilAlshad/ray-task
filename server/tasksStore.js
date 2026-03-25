import fs from "fs";

const defaultTasks = [
  {
    id: "1",
    title: "Design the homepage layout",
    description: "Create wireframes and mockups",
    status: "DONE",
    order: 0,
  },
  {
    id: "2",
    title: "Build the TaskCard component",
    description: "Implement drag and drop functionality",
    status: "DONE",
    order: 1,
  },
  {
    id: "3",
    title: "Integrate API endpoints",
    description: "Connect frontend to backend",
    status: "IN_PROGRESS",
    order: 0,
  },
  {
    id: "4",
    title: "Write unit tests",
    description: "Ensure code quality",
    status: "IN_PROGRESS",
    order: 1,
  },
  {
    id: "5",
    title: "Deploy to production",
    description: "Set up hosting and domains",
    status: "TODO",
    order: 0,
  },
  {
    id: "6",
    title: "Set up CI/CD pipeline",
    description: "Automate testing and deployment",
    status: "TODO",
    order: 1,
  },
];

function readTasksFromDisk(dbPath) {
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {}

  try {
    fs.writeFileSync(dbPath, JSON.stringify(defaultTasks, null, 2));
  } catch {}

  return [...defaultTasks];
}

function saveTasksToDisk(dbPath, tasks) {
  fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));
}

function moveTaskInList(tasks, data) {
  const taskIndex = tasks.findIndex((task) => task.id === data.id);
  if (taskIndex === -1) {
    return tasks;
  }

  const updatedTasks = [...tasks];
  const [task] = updatedTasks.splice(taskIndex, 1);
  const movedTask = { ...task, status: data.status };

  const columnTasks = updatedTasks
    .filter((item) => item.status === data.status)
    .sort((a, b) => a.order - b.order);

  columnTasks.splice(data.order, 0, movedTask);
  columnTasks.forEach((item, index) => {
    item.order = index;
  });

  return [
    ...updatedTasks.filter((item) => item.status !== data.status),
    ...columnTasks,
  ];
}

export function createTasksStore(dbPath) {
  let currentTasks = readTasksFromDisk(dbPath);

  return {
    getAll() {
      return currentTasks;
    },
    move(data) {
      currentTasks = moveTaskInList(currentTasks, data);
      saveTasksToDisk(dbPath, currentTasks);
    },
    add(newTask) {
      currentTasks = [...currentTasks, newTask];
      saveTasksToDisk(dbPath, currentTasks);
    },
    update(updatedTask) {
      currentTasks = currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      saveTasksToDisk(dbPath, currentTasks);
    },
    delete(taskId) {
      currentTasks = currentTasks.filter((task) => task.id !== taskId);
      saveTasksToDisk(dbPath, currentTasks);
    },
  };
}
