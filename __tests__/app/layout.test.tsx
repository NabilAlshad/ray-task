import type { ReactElement } from "react";

jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "mock-geist-sans" }),
  Geist_Mono: () => ({ variable: "mock-geist-mono" }),
}));

jest.mock("@/lib/utils/lazy", () => ({
  LazyLoadingSpinner: () => <div>Loading Spinner</div>,
}));

describe("app/layout", () => {
  it("exports metadata and wraps children in the root html structure", async () => {
    const layoutModule = await import("@/app/layout");
    const RootLayout = layoutModule.default;
    const layout = RootLayout({
      children: <div>Child content</div>,
    }) as ReactElement<{
      lang: string;
      className: string;
      children: ReactElement;
    }>;

    expect(layoutModule.metadata.title).toBe("Create Next App");
    expect(layout.props.lang).toBe("en");
    expect(layout.props.className).toContain("mock-geist-sans");
    expect(layout.props.className).toContain("mock-geist-mono");

    const body = layout.props.children as ReactElement<{
      className: string;
      children: ReactElement;
    }>;
    const suspense = body.props.children as ReactElement<{
      children: ReactElement;
    }>;
    const clientWrapper = suspense.props.children as ReactElement<{
      children: ReactElement;
    }>;
    const child = clientWrapper.props.children as ReactElement<{
      children: string;
    }>;

    expect(body.props.className).toContain("min-h-full");
    expect(child.props.children).toBe("Child content");
  });
});
