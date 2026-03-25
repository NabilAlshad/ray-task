import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    window.localStorage.clear();

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
    expect(screen.getAllByText("Member")).toHaveLength(1);
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

  it("switches the current user from the modal without reloading", async () => {
    const user = userEvent.setup();
    useCurrentUserStore.setState({
      currentUser: {
        id: "socket-1",
        name: "Alice 12",
        color: "bg-red-500",
        role: "ADMIN",
      },
    });

    render(<LiveUsers />);

    await user.click(screen.getByRole("button", { name: "Create User" }));
    expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
    await user.clear(screen.getByRole("textbox", { name: "Name" }));
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Casey");
    await user.selectOptions(screen.getByRole("combobox", { name: "Role" }), "VIEWER");
    await user.click(screen.getByRole("button", { name: "Choose teal 500 avatar color" }));
    await user.click(screen.getByRole("button", { name: "Save User" }));

    expect(mockEmit).toHaveBeenCalledWith("createUser", {
      name: "Casey",
      color: "bg-teal-500",
      role: "VIEWER",
    });

    act(() => {
      mockSocketHandlers.userCreated?.({
        id: "user-casey",
        name: "Casey",
        color: "bg-teal-500",
        role: "VIEWER",
      });
    });

    expect(mockEmit).toHaveBeenCalledWith("userJoined", {
      id: "socket-1",
      name: "Casey",
      color: "bg-teal-500",
      role: "VIEWER",
    });
    expect(screen.getByText("Casey")).toBeInTheDocument();
    expect(screen.getByText("Read-only")).toBeInTheDocument();
    expect(window.localStorage.getItem("task-board-current-user")).toContain("Casey");
    expect(screen.queryByRole("heading", { name: "Switch User" })).not.toBeInTheDocument();
  });

  it("closes the create modal when creation is cancelled", async () => {
    const user = userEvent.setup();
    useCurrentUserStore.setState({
      currentUser: {
        id: "socket-1",
        name: "Alice 12",
        color: "bg-red-500",
        role: "ADMIN",
      },
    });

    render(<LiveUsers />);

    await user.click(screen.getByRole("button", { name: "Create User" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("heading", { name: "Create User" })).not.toBeInTheDocument();
  });

  it("shows preset users from json in the switch modal and lets you pick one", async () => {
    const user = userEvent.setup();
    useCurrentUserStore.setState({
      currentUser: {
        id: "socket-1",
        name: "Alice 12",
        color: "bg-red-500",
        role: "ADMIN",
      },
    });

    render(<LiveUsers />);

    await user.click(screen.getByRole("button", { name: "Switch User" }));

    expect(screen.getByText("Choose an existing user")).toBeInTheDocument();
    expect(screen.getByText("Preset users are loaded from `data/users.json`.")).toBeInTheDocument();
    expect(screen.getAllByText("Alice 12")).toHaveLength(2);
    expect(screen.getAllByText("Bob 22")).toHaveLength(1);
    expect(screen.getByText("Current")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Select saved user Bob 22" }));

    expect(mockEmit).toHaveBeenCalledWith("userJoined", {
      id: "socket-1",
      name: "Bob 22",
      color: "bg-blue-500",
      role: "MEMBER",
    });
    expect(screen.queryByRole("heading", { name: "Switch User" })).not.toBeInTheDocument();
  });

  it("shows the user management section as read-only for members and viewers", async () => {
    const user = userEvent.setup();
    useCurrentUserStore.setState({
      currentUser: {
        id: "socket-1",
        name: "Bob 22",
        color: "bg-blue-500",
        role: "MEMBER",
      },
    });

    render(<LiveUsers />);

    expect(screen.queryByRole("button", { name: "Create User" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Switch User" }));

    expect(screen.queryByText("Create a new user")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create User" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Name" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete saved user Alice 12" })).not.toBeInTheDocument();
  });

  it("lets admins delete a saved user from the switch modal", async () => {
    const user = userEvent.setup();
    useCurrentUserStore.setState({
      currentUser: {
        id: "socket-1",
        name: "Alice 12",
        color: "bg-red-500",
        role: "ADMIN",
      },
    });

    render(<LiveUsers />);

    await user.click(screen.getByRole("button", { name: "Switch User" }));
    await user.click(screen.getByRole("button", { name: "Delete saved user Bob 22" }));

    expect(mockEmit).toHaveBeenCalledWith("deleteUser", "user-bob-22");
  });
});
