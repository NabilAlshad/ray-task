import { act, render, screen } from "@testing-library/react";
import { LiveUsers } from "@/components/ui/compound/LiveUsers";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";

const mockSocketHandlers: Record<string, (...args: unknown[]) => void> = {};
let mockSocketId = "socket-1";
let mockSocketRecovered = false;
const mockEmit = jest.fn();
const mockOn = jest.fn((event: string, handler: (...args: unknown[]) => void) => {
  mockSocketHandlers[event] = handler;
});
const mockOff = jest.fn((event: string) => {
  delete mockSocketHandlers[event];
});

jest.mock("@/lib/socket", () => ({
  socket: {
    get id() {
      return mockSocketId;
    },
    get recovered() {
      return mockSocketRecovered;
    },
    on: (event: string, handler: (...args: unknown[]) => void) => {
      mockOn(event, handler);
    },
    off: (event: string) => {
      mockOff(event);
    },
    emit: (...args: unknown[]) => {
      mockEmit(...args);
    },
  },
}));

describe("LiveUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSocketId = "socket-1";
    mockSocketRecovered = false;
    useCurrentUserStore.setState({ currentUser: null });

    for (const key of Object.keys(mockSocketHandlers)) {
      delete mockSocketHandlers[key];
    }
  });

  it("shows live collaboration updates from socket events", () => {
    render(<LiveUsers />);

    expect(screen.getByText("Live Collaboration")).toBeInTheDocument();
    expect(screen.getByText("Connecting...")).toBeInTheDocument();

    act(() => {
      mockSocketHandlers.connect?.();
      mockSocketHandlers.currentUser?.({
        id: "socket-1",
        name: "Alice 12",
        color: "bg-red-500",
        role: "MEMBER",
      });
    });

    expect(mockEmit).toHaveBeenCalledWith(
      "userJoined",
      expect.objectContaining({ id: "socket-1" }),
    );
    expect(screen.queryByText("Connecting...")).not.toBeInTheDocument();
    expect(screen.getAllByText("Member")).toHaveLength(2);
    expect(screen.getByText("Can create, edit, and move")).toBeInTheDocument();

    act(() => {
      mockSocketHandlers.userJoined?.({
        id: "socket-2",
        name: "Bob 22",
        color: "bg-blue-500",
        role: "VIEWER",
      });
    });

    expect(screen.getByTitle(/Bob 22/)).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();

    act(() => {
      mockSocketHandlers.userLeft?.("socket-2");
    });

    expect(screen.queryByTitle(/Bob 22/)).not.toBeInTheDocument();
  });

  it("hydrates the active user list from the server without rebroadcasting on recovered connect", () => {
    mockSocketRecovered = true;
    useCurrentUserStore.setState({
      currentUser: {
        id: "",
        name: "Alice 12",
        color: "bg-red-500",
        role: "ADMIN",
      },
    });

    render(<LiveUsers />);

    act(() => {
      mockSocketHandlers.activeUsers?.([
        { id: "socket-2", name: "Bob 22", color: "bg-blue-500", role: "VIEWER" },
      ]);
      mockSocketHandlers.connect?.();
    });

    expect(screen.getByTitle(/Bob 22/)).toBeInTheDocument();
    expect(mockEmit).not.toHaveBeenCalledWith(
      "userJoined",
      expect.objectContaining({ id: "socket-1" }),
    );
  });

  it("stays in the connecting state before the socket connect event fires", () => {
    render(<LiveUsers />);

    expect(screen.getByText("Connecting...")).toBeInTheDocument();
    expect(mockEmit).not.toHaveBeenCalled();
  });
});
