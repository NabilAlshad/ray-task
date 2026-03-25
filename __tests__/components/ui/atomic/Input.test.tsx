import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/atomic/Input";

describe("Input", () => {
  it("forwards refs and applies error styling", () => {
    const ref = createRef<HTMLInputElement>();

    render(<Input ref={ref} aria-label="Task title" error />);

    const input = screen.getByRole("textbox", { name: "Task title" });

    expect(ref.current).toBe(input);
    expect(input).toHaveClass("border-red-500");
  });

  it("does not apply error styling when error is not provided", () => {
    render(<Input aria-label="Task title" />);

    expect(screen.getByRole("textbox", { name: "Task title" })).not.toHaveClass(
      "border-red-500",
    );
  });
});
