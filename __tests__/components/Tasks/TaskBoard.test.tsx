import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskBoard } from "@/components/Tasks/TaskBoard";
import { sampleTasks } from "@/test-utils/sampleTasks";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTaskStore } from "@/store/useTaskStore";

const mockUseDroppable = jest.fn(() => ({
  setNodeRef: jest.fn(),
  isOver: false,
}));
const mockUseSortable = jest.fn(() => ({
  attributes: {},
  listeners: {},
  setNodeRef: jest.fn(),
  transform: null,
  transition: undefined,
  isDragging: false,
}));

const mockUseTaskSocket = jest.fn();
const mockUseTaskModalLogic = jest.fn();
const mockUseTaskDragLogic = jest.fn();

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn((sensor: unknown, options: unknown) => ({ sensor, options })),
  useSensors: jest.fn((...sensors: unknown[]) => sensors),
  useDroppable: () => mockUseDroppable(),
}));

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: () => mockUseSortable(),
  SortableContext: ({ children }: { children: ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: {},
}));

jest.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => undefined),
    },
  },
}));

jest.mock("@/lib/hooks/useTaskSocket", () => ({
  useTaskSocket: () => mockUseTaskSocket(),
}));

jest.mock("@/lib/hooks/useTaskModalLogic", () => ({
  useTaskModalLogic: () => mockUseTaskModalLogic(),
}));

jest.mock("@/lib/hooks/useTaskDragLogic", () => ({
  useTaskDragLogic: () => mockUseTaskDragLogic(),
}));

describe("TaskBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCurrentUserStore.setState({
      currentUser: {
        id: "user-1",
        name: "Admin User",
        color: "bg-blue-500",
        role: "ADMIN",
      },
    });
    useTaskStore.setState({ tasks: [] });
    useNotificationStore.setState({ notifications: [] });
    mockUseDroppable.mockReturnValue({
      setNodeRef: jest.fn(),
      isOver: false,
    });
    mockUseSortable.mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    });
    mockUseTaskModalLogic.mockReturnValue({
      isModalOpen: false,
      isTaskModalOpen: false,
      setIsModalOpen: jest.fn(),
      taskToEdit: null,
      taskToView: null,
      taskToDelete: null,
      handleOpenAddModal: jest.fn(),
      handleOpenViewModal: jest.fn(),
      handleCloseViewModal: jest.fn(),
      handleOpenEditModal: jest.fn(),
      handleSubmitModal: jest.fn(),
      handleRequestDeleteTask: jest.fn(),
      handleConfirmDeleteTask: jest.fn(),
      handleCloseDeleteModal: jest.fn(),
    });
    mockUseTaskDragLogic.mockReturnValue({
      activeTask: null,
      previewTasks: null,
      handleDragStart: jest.fn(),
      handleDragOver: jest.fn(),
      handleDragEnd: jest.fn(),
    });
  });

  it("renders columns and uses modal handlers for board actions", async () => {
    const user = userEvent.setup();
    const handleOpenAddModal = jest.fn();
    const handleConfirmDeleteTask = jest.fn();

    useTaskStore.setState({ tasks: sampleTasks });
    mockUseTaskModalLogic.mockReturnValue({
      isModalOpen: false,
      isTaskModalOpen: false,
      setIsModalOpen: jest.fn(),
      taskToEdit: null,
      taskToView: null,
      taskToDelete: sampleTasks[0],
      handleOpenAddModal,
      handleOpenViewModal: jest.fn(),
      handleCloseViewModal: jest.fn(),
      handleOpenEditModal: jest.fn(),
      handleSubmitModal: jest.fn(),
      handleRequestDeleteTask: jest.fn(),
      handleConfirmDeleteTask,
      handleCloseDeleteModal: jest.fn(),
    });

    render(<TaskBoard />);

    expect(screen.getByRole("heading", { name: "Project Board" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New Task" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(handleOpenAddModal).toHaveBeenCalledTimes(1);
    expect(handleConfirmDeleteTask).toHaveBeenCalledTimes(1);
    expect(mockUseTaskSocket).toHaveBeenCalledTimes(1);
  });

  it("does not render the delete confirmation action when no task is pending deletion", () => {
    useTaskStore.setState({ tasks: sampleTasks });

    render(<TaskBoard />);

    expect(screen.queryByRole("button", { name: "Yes, delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project Board" })).toBeInTheDocument();
  });

  it("disables task creation for viewers", () => {
    useCurrentUserStore.setState({
      currentUser: {
        id: "user-2",
        name: "Viewer User",
        color: "bg-gray-500",
        role: "VIEWER",
      },
    });

    render(<TaskBoard />);

    expect(screen.getByRole("button", { name: "New Task" })).toBeDisabled();
  });

  it("renders the task details modal when a task is selected for viewing", () => {
    useTaskStore.setState({ tasks: sampleTasks });
    mockUseTaskModalLogic.mockReturnValue({
      isModalOpen: false,
      isTaskModalOpen: false,
      setIsModalOpen: jest.fn(),
      taskToEdit: null,
      taskToView: sampleTasks[0],
      taskToDelete: null,
      handleOpenAddModal: jest.fn(),
      handleOpenViewModal: jest.fn(),
      handleCloseViewModal: jest.fn(),
      handleOpenEditModal: jest.fn(),
      handleSubmitModal: jest.fn(),
      handleRequestDeleteTask: jest.fn(),
      handleConfirmDeleteTask: jest.fn(),
      handleCloseDeleteModal: jest.fn(),
    });

    render(<TaskBoard />);

    expect(screen.getByRole("heading", { name: "Task Details" })).toBeInTheDocument();
    expect(screen.getAllByText("Document the board")).toHaveLength(2);
  });
});
