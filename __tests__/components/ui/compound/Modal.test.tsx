import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/template/Modal";

describe("Modal", () => {
  it("renders only when open and closes from the close button", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Task details">
        <p>Hidden content</p>
      </Modal>,
    );

    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();

    rerender(
      <Modal isOpen onClose={onClose} title="Task details">
        <p>Visible content</p>
      </Modal>,
    );

    expect(
      screen.getByRole("heading", { name: "Task details" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Close Task details" }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render any dialog content when closed", () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Closed modal">
        <p>Should not exist</p>
      </Modal>,
    );

    expect(
      screen.queryByRole("heading", { name: "Closed modal" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Should not exist")).not.toBeInTheDocument();
  });
});
