import type { Task, TaskMovePayload, TaskOptimisticAction } from "@/types";

export function addTaskToList(tasks: Task[], task: Task) {
  return [...tasks, task];
}

export function updateTaskInList(
  tasks: Task[],
  id: Task["id"],
  updates: Partial<Task> | Task,
) {
  return tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
}

export function deleteTaskFromList(tasks: Task[], id: Task["id"]) {
  return tasks.filter((task) => task.id !== id);
}

export function moveTaskInList(
  tasks: Task[],
  id: TaskMovePayload["id"],
  newStatus: TaskMovePayload["status"],
  newOrder: TaskMovePayload["order"],
) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return tasks;
  }

  const updatedTasks = [...tasks];
  const [task] = updatedTasks.splice(taskIndex, 1);
  const movedTask = { ...task, status: newStatus };

  const columnTasks = updatedTasks
    .filter((item) => item.status === newStatus)
    .sort((a, b) => a.order - b.order);

  columnTasks.splice(newOrder, 0, movedTask);
  columnTasks.forEach((item, index) => {
    item.order = index;
  });

  return [
    ...updatedTasks.filter((item) => item.status !== newStatus),
    ...columnTasks,
  ];
}

export function applyTaskOptimisticAction(tasks: Task[], action: TaskOptimisticAction) {
  switch (action.type) {
    case "add":
      return addTaskToList(tasks, action.task);
    case "update":
      return updateTaskInList(tasks, action.task.id, action.task);
    case "delete":
      return deleteTaskFromList(tasks, action.id);
    case "move":
      return moveTaskInList(
        tasks,
        action.payload.id,
        action.payload.status,
        action.payload.order,
      );
    default:
      return tasks;
  }
}
