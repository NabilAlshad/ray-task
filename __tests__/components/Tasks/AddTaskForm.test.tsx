import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTaskForm from "@/components/Tasks/AddTaskForm";

describe("AddTaskForm", () => {
  it("submits trimmed values and resets the field", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText("Enter a new task…"), "  Review PRs  ");
    await user.click(screen.getByRole("button", { name: "+ Add Task" }));

    expect(onAdd).toHaveBeenCalledWith("Review PRs");
    expect(screen.getByPlaceholderText("Enter a new task…")).toHaveValue("");
  });

  it("does not submit blank values", async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();

    render(<AddTaskForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText("Enter a new task…"), "   ");

    const button = screen.getByRole("button", { name: "+ Add Task" });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onAdd).not.toHaveBeenCalled();
  });
});
