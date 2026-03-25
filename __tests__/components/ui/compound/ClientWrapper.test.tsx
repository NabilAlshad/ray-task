import { render, screen } from "@testing-library/react";
import { ClientWrapper } from "@/components/ui/compound/ClientWrapper";

describe("ClientWrapper", () => {
  it("renders its children on the client", () => {
    render(
      <ClientWrapper>
        <div>Wrapped content</div>
      </ClientWrapper>,
    );

    expect(screen.getByText("Wrapped content")).toBeInTheDocument();
  });
});
