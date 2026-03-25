import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/atomic/Button";

describe("Button", () => {
  it("renders variant and size styles and handles clicks", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button variant="danger" size="sm" onClick={onClick}>
        Delete
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Delete" });

    expect(button).toHaveClass("bg-red-600");
    expect(button).toHaveClass("h-8");

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire clicks when disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
