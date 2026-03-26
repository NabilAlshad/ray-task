import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationCenter } from "@/components/ui/template/NotificationCenter";
import { useNotificationStore } from "@/store/useNotificationStore";

describe("NotificationCenter", () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
  });

  it("renders notifications and dismisses them", async () => {
    const user = userEvent.setup();

    useNotificationStore.setState({
      notifications: [
        {
          id: "notice-1",
          title: "Task created",
          message: "A new task is ready.",
          variant: "success",
        },
      ],
    });

    render(<NotificationCenter />);

    expect(screen.getByText("Task created")).toBeInTheDocument();
    expect(screen.getByText("A new task is ready.")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );

    expect(screen.queryByText("Task created")).not.toBeInTheDocument();
  });

  it("renders nothing actionable when there are no notifications", () => {
    render(<NotificationCenter />);

    expect(
      screen.queryByRole("button", { name: "Dismiss notification" }),
    ).not.toBeInTheDocument();
  });
});
