import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskModal } from "@/components/Tasks/TaskModal";
import { sampleTasks } from "@/test-utils/sampleTasks";

describe("TaskModal", () => {
  it("submits a new task", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    render(<TaskModal isOpen onClose={onClose} onSubmit={onSubmit} taskToEdit={null} />);

    await user.type(screen.getByRole("textbox", { name: "Title" }), "Plan sprint");
    await user.type(
      screen.getByRole("textbox", { name: "Description (optional)" }),
      "Outline sprint goals",
    );
    await user.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Plan sprint",
      description: "Outline sprint goals",
      status: "TODO",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("renders existing task data in edit mode", () => {
    render(
      <TaskModal
        isOpen
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        taskToEdit={sampleTasks[0]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Edit Task" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("Write docs");
    expect(screen.getByRole("textbox", { name: "Description (optional)" })).toHaveValue(
      "Document the board",
    );
  });

  it("does not submit when the title is blank", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    const onClose = jest.fn();

    render(<TaskModal isOpen onClose={onClose} onSubmit={onSubmit} taskToEdit={null} />);

    const createButton = screen.getByRole("button", { name: "Create Task" });
    expect(createButton).toBeDisabled();

    await user.click(createButton);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
