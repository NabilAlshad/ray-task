import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Textarea } from "@/components/ui/atomic/Textarea";

describe("Textarea", () => {
  it("forwards refs and applies error styling", () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(<Textarea ref={ref} aria-label="Task description" error rows={5} />);

    const textarea = screen.getByRole("textbox", { name: "Task description" });

    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveClass("border-red-500");
  });

  it("does not apply error styling when error is falsey", () => {
    render(<Textarea aria-label="Task description" />);

    expect(
      screen.getByRole("textbox", { name: "Task description" }),
    ).not.toHaveClass("border-red-500");
  });
});
