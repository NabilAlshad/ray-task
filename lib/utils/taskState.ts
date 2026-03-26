import type { Task, TaskMovePayload, TaskOptimisticAction } from "@/types";

const normalizeOrder = (tasks: Task[]) =>
  [...tasks]
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));

export function addTaskToList(tasks: Task[], task: Task) {
  if (tasks.some((item) => item.id === task.id)) {
    return tasks;
  }

  const updatedTasks = [...tasks, task];
  const sameStatusTasks = updatedTasks.filter(
    (item) => item.status === task.status,
  );

  const normalizedSameStatus = normalizeOrder(sameStatusTasks);

  return [
    ...updatedTasks.filter((item) => item.status !== task.status),
    ...normalizedSameStatus,
  ];
}

export function updateTaskInList(
  tasks: Task[],
  id: Task["id"],
  updates: Partial<Task> | Task,
) {
  return tasks.map((task) => (task.id === id ? { ...task, ...updates } : task));
}

export function deleteTaskFromList(tasks: Task[], id: Task["id"]) {
  const remainingTasks = tasks.filter((task) => task.id !== id);

  const normalizedTasks = Array.from(
    new Set(remainingTasks.map((t) => t.status)),
  ).flatMap((status) => {
    return normalizeOrder(
      remainingTasks.filter((task) => task.status === status),
    );
  });

  return normalizedTasks;
}

export function moveTaskInList(
  tasks: Task[],
  id: TaskMovePayload["id"],
  newStatus: TaskMovePayload["status"],
  newOrder: TaskMovePayload["order"],
) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return tasks;
  }

  const sourceStatus = task.status;
  const movedTask = { ...task, status: newStatus };
  const remainingTasks = tasks.filter((item) => item.id !== id);

  const sourceTasks = normalizeOrder(
    remainingTasks.filter((item) => item.status === sourceStatus),
  );
  const destinationTasks = normalizeOrder(
    remainingTasks.filter((item) => item.status === newStatus),
  );

  if (sourceStatus === newStatus) {
    const updatedTasks = [...sourceTasks];
    updatedTasks.splice(newOrder, 0, { ...movedTask, order: newOrder });
    const orderedTasks = updatedTasks.map((task, index) => ({
      ...task,
      order: index,
    }));
    return [
      ...remainingTasks.filter((item) => item.status !== sourceStatus),
      ...orderedTasks,
    ];
  }

  const updatedDestination = [...destinationTasks];
  updatedDestination.splice(newOrder, 0, { ...movedTask, order: newOrder });
  const orderedDestination = updatedDestination.map((task, index) => ({
    ...task,
    order: index,
  }));

  return [
    ...remainingTasks.filter(
      (item) => item.status !== sourceStatus && item.status !== newStatus,
    ),
    ...sourceTasks,
    ...orderedDestination,
  ];
}

export function applyTaskOptimisticAction(
  tasks: Task[],
  action: TaskOptimisticAction,
) {
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
