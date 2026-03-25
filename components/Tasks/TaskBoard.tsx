import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { ConfirmationModal } from "@/components/Tasks/ConfirmationModal";
import { NotificationCenter } from "@/components/ui/compound/NotificationCenter";
import { useTaskStore } from "@/store/useTaskStore";
import { useCurrentUserStore } from "@/store/useCurrentUserStore";
import {
  canCreateTask,
  canDeleteTask,
  canMoveTask,
  canUpdateTask,
  type TaskColumnDefinition,
} from "@/types";
import { Plus } from "lucide-react";
import { useTaskSocket } from "@/lib/hooks/useTaskSocket";
import { useTaskModalLogic } from "@/lib/hooks/useTaskModalLogic";
import { useTaskDragLogic } from "@/lib/hooks/useTaskDragLogic";

export function TaskBoard() {
  const tasks = useTaskStore((state) => state.tasks);
  const currentUser = useCurrentUserStore((state) => state.currentUser);

  useTaskSocket();

  const {
    isModalOpen,
    setIsModalOpen,
    taskToEdit,
    taskToDelete,
    handleOpenAddModal,
    handleOpenEditModal,
    handleSubmitModal,
    handleRequestDeleteTask,
    handleConfirmDeleteTask,
    handleCloseDeleteModal,
  } = useTaskModalLogic();

  const { activeTask, handleDragStart, handleDragOver, handleDragEnd } =
    useTaskDragLogic();

  const role = currentUser?.role ?? "VIEWER";
  const canCreate = canCreateTask(role);
  const canEdit = canUpdateTask(role);
  const canDelete = canDeleteTask(role);
  const canMove = canMoveTask(role);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columns: TaskColumnDefinition[] = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
  ];

  return (
    <div className="flex justify-center w-full px-4 overflow-x-auto pb-10">
      <NotificationCenter />

      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8 mt-12">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Project Board
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your team&apos;s tasks in real-time.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            disabled={!canCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
            title={
              canCreate
                ? "Create a new task"
                : "Your current role does not allow creating tasks"
            }
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={canMove ? handleDragStart : undefined}
          onDragOver={canMove ? handleDragOver : undefined}
          onDragEnd={canMove ? handleDragEnd : undefined}
        >
          <div className="flex flex-col md:flex-row gap-6 md:items-start select-none">
            {columns.map((col) => {
              const columnTasks = tasks
                .filter((t) => t.status === col.id)
                .sort((a, b) => a.order - b.order);

              return (
                <TaskColumn
                  key={col.id}
                  status={col.id}
                  title={col.title}
                  tasks={columnTasks}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleRequestDeleteTask}
                  canEditTask={canEdit}
                  canDeleteTask={canDelete}
                  canMoveTask={canMove}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 rotate-2 scale-105 transition-transform shadow-2xl">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  canEdit={false}
                  canDelete={false}
                  canDrag={canMove}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        key={`${taskToEdit?.id ?? "new"}-${isModalOpen ? "open" : "closed"}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        taskToEdit={taskToEdit}
      />

      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete task?"
        description={
          taskToDelete
            ? `This will permanently delete "${taskToDelete.title}" from the board.`
            : ""
        }
        confirmLabel="Yes, delete"
        cancelLabel="Keep task"
        isDanger
        onConfirm={handleConfirmDeleteTask}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
}
