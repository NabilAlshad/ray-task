import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCard } from "@/components/Tasks/TaskCard";
import { sampleTasks } from "@/test-utils/sampleTasks";

const mockUseSortable = jest.fn(() => ({
  attributes: {},
  listeners: {},
  setNodeRef: jest.fn(),
  transform: null,
  transition: undefined,
  isDragging: false,
}));

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => mockUseSortable(),
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => undefined),
    },
  },
}));

describe("TaskCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders task details and fires edit/delete actions", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <TaskCard
        task={sampleTasks[0]}
        onEdit={onEdit}
        onDelete={onDelete}
        canEdit
        canDelete
        canDrag
      />,
    );

    expect(screen.getByText("Write docs")).toBeInTheDocument();
    expect(screen.getByText("Document the board")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit task Write docs" }));
    await user.click(screen.getByRole("button", { name: "Delete task Write docs" }));

    expect(onEdit).toHaveBeenCalledWith(sampleTasks[0]);
    expect(onDelete).toHaveBeenCalledWith(sampleTasks[0]);
  });

  it("does not render a description block when the task has no description", () => {
    render(
      <TaskCard
        task={{ ...sampleTasks[0], description: undefined }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        canEdit
        canDelete
        canDrag
      />,
    );

    expect(screen.queryByText("Document the board")).not.toBeInTheDocument();
  });

  it("hides task action buttons when the role does not allow them", () => {
    render(
      <TaskCard
        task={sampleTasks[0]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        canEdit={false}
        canDelete={false}
        canDrag={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Edit task Write docs" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete task Write docs" })).not.toBeInTheDocument();
  });
});
