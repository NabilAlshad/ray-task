import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { TaskColumn } from "@/components/Tasks/TaskColumn";
import { sampleTasks } from "@/test-utils/sampleTasks";

const mockUseDroppable = jest.fn(() => ({
  setNodeRef: jest.fn(),
  isOver: false,
}));

jest.mock("@dnd-kit/core", () => ({
  useDroppable: () => mockUseDroppable(),
}));

jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  verticalListSortingStrategy: {},
}));

jest.mock("@/components/ui/compound/TaskCard", () => ({
  TaskCard: ({ task }: { task: { title: string } }) => <div>{task.title}</div>,
}));

describe("TaskColumn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: false,
    });
  });

  it("renders the column title, task count, and tasks", () => {
    render(
      <TaskColumn
        status="TODO"
        title="To Do"
        tasks={[sampleTasks[0]]}
        onViewTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        canEditTask
        canDeleteTask
        canMoveTask
      />,
    );

    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Write docs")).toBeInTheDocument();
  });

  it("applies hover styling when the column is the current drop target", () => {
    mockUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: true,
    });

    const { container } = render(
      <TaskColumn
        status="TODO"
        title="To Do"
        tasks={[sampleTasks[0]]}
        onViewTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        canEditTask
        canDeleteTask
        canMoveTask
      />,
    );

    expect(container.firstChild).toHaveClass("ring-amber-400");
  });

  it("renders an empty count when no tasks exist in the column", () => {
    render(
      <TaskColumn
        status="DONE"
        title="Done"
        tasks={[]}
        onViewTask={jest.fn()}
        onEditTask={jest.fn()}
        onDeleteTask={jest.fn()}
        canEditTask={false}
        canDeleteTask={false}
        canMoveTask={false}
      />,
    );

    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
