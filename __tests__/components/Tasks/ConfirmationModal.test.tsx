import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationModal } from "@/components/Tasks/ConfirmationModal";

describe("ConfirmationModal", () => {
  it("renders actions and fires confirm and close handlers", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    render(
      <ConfirmationModal
        isOpen
        title="Delete task?"
        description="This action cannot be undone."
        confirmLabel="Delete forever"
        cancelLabel="Cancel"
        isDanger
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Delete forever" }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });

  it("does not render when closed", () => {
    render(
      <ConfirmationModal
        isOpen={false}
        title="Delete task?"
        description="Hidden"
        onConfirm={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.queryByRole("heading", { name: "Delete task?" })).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
