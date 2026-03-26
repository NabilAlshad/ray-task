import {
  addTaskToList,
  deleteTaskFromList,
  moveTaskInList,
} from "@/lib/utils/taskState";
import type { Task } from "@/types";

describe("taskState utils", () => {
  const initialTasks: Task[] = [
    { id: "1", title: "A", status: "TODO", order: 0 },
    { id: "2", title: "B", status: "TODO", order: 1 },
    { id: "3", title: "C", status: "IN_PROGRESS", order: 0 },
  ];

  it("addTaskToList should append and normalize order in same status", () => {
    const newTask: Task = {
      id: "4",
      title: "D",
      status: "TODO",
      order: 99,
    };

    const next = addTaskToList(initialTasks, newTask);

    const todoTasks = next.filter((task) => task.status === "TODO");
    expect(todoTasks.map((task) => task.order)).toEqual([0, 1, 2]);
    expect(todoTasks.some((task) => task.id === "4")).toBe(true);
  });

  it("moveTaskInList should normalize source and destination order when moving across columns", () => {
    const next = moveTaskInList(initialTasks, "2", "DONE", 0);

    const todoTasks = next.filter((task) => task.status === "TODO");
    const doneTasks = next.filter((task) => task.status === "DONE");

    expect(todoTasks.map((task) => task.order)).toEqual([0]);
    expect(doneTasks.map((task) => task.order)).toEqual([0]);
    expect(doneTasks[0].id).toBe("2");
  });

  it("moveTaskInList should reposition and normalize order when moving within same column", () => {
    const next = moveTaskInList(initialTasks, "2", "TODO", 0);

    const todoTasks = next.filter((task) => task.status === "TODO");

    expect(todoTasks.map((task) => task.id)).toEqual(["2", "1"]);
    expect(todoTasks.map((task) => task.order)).toEqual([0, 1]);
  });

  it("deleteTaskFromList should remove a task and re-normalize all statuses", () => {
    const next = deleteTaskFromList(initialTasks, "1");

    const todoTasks = next.filter((task) => task.status === "TODO");
    const inProgressTasks = next.filter(
      (task) => task.status === "IN_PROGRESS",
    );

    expect(todoTasks.map((task) => task.order)).toEqual([0]);
    expect(inProgressTasks.map((task) => task.order)).toEqual([0]);
  });
});
