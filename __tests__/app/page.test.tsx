import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("@/components/live-users/LiveUsers", () => ({
  LiveUsers: () => <div>Mock LiveUsers</div>,
}));

jest.mock("@/components/Tasks/TaskBoard", () => ({
  TaskBoard: () => <div>Mock TaskBoard</div>,
}));

describe("app/page", () => {
  it("renders the page composition", () => {
    render(<Home />);

    expect(screen.getByText("Mock LiveUsers")).toBeInTheDocument();
    expect(screen.getByText("Mock TaskBoard")).toBeInTheDocument();
  });

  it("keeps the main landmark in the page structure", () => {
    render(<Home />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
