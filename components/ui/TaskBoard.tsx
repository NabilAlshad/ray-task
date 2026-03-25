import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { useTaskStore } from "@/store/useTaskStore";
import { socket } from "@/lib/socket";
import { Task, TaskStatus } from "@/types";
import { Plus } from "lucide-react";

export function TaskBoard() {
  const { tasks, addTask, updateTask, moveTask, deleteTask, setTasks } = useTaskStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Initialize Socket Connection & Listeners
  useEffect(() => {
    socket.connect();

    socket.on('initTasks', (startupTasks: Task[]) => {
      setTasks(startupTasks);
    });

    socket.on('taskAdded', (newTask: Task) => {
      addTask(newTask);
    });

    socket.on('taskUpdated', (updatedTask: Task) => {
      updateTask(updatedTask.id, updatedTask);
    });

    socket.on('taskMoved', (data: { id: string, status: TaskStatus, order: number }) => {
      moveTask(data.id, data.status, data.order);
    });

    socket.on('taskDeleted', (id: string) => {
      deleteTask(id);
    });

    return () => {
      socket.off('initTasks');
      socket.off('taskAdded');
      socket.off('taskUpdated');
      socket.off('taskMoved');
      socket.off('taskDeleted');
      socket.disconnect();
    };
  }, [setTasks, addTask, updateTask, moveTask, deleteTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns: { id: TaskStatus; title: string }[] = [
    { id: "TODO", title: "To Do" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "DONE", title: "Done" },
  ];

  /* ---------------- Modal Handlers ---------------- */
  const handleOpenAddModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleSubmitModal = (data: Partial<Task>) => {
    if (taskToEdit) {
      const updated = { ...taskToEdit, ...data };
      updateTask(updated.id, updated);
      socket.emit('taskUpdated', updated);
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substring(2, 9),
        title: data.title!,
        description: data.description,
        status: "TODO",
        order: tasks.filter(t => t.status === "TODO").length,
      };
      addTask(newTask);
      socket.emit('taskAdded', newTask);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    socket.emit('taskDeleted', id);
  };

  /* ---------------- Dnd Handlers ---------------- */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTaskMatch = tasks.find((t) => t.id === activeId);
    if (!activeTaskMatch) return;

    // Find if we hovered over another task or a column directly
    const isOverTask = over.data.current?.type === "Task";
    const overTaskMatch = isOverTask ? tasks.find(t => t.id === overId) : null;
    
    // Determine new status and order index
    let newStatus = activeTaskMatch.status;
    let newOrderIndex = activeTaskMatch.order;

    if (isOverTask && overTaskMatch) {
      newStatus = overTaskMatch.status;
      newOrderIndex = overTaskMatch.order;
    } else if (over.data.current?.type === "Column") {
      newStatus = over.data.current.status as TaskStatus;
      // Dropping directly on column sets it as last item
      newOrderIndex = tasks.filter(t => t.status === newStatus).length;
    }

    if (activeTaskMatch.status !== newStatus || activeTaskMatch.order !== newOrderIndex) {
      // Optmistic local update
      moveTask(activeId, newStatus, newOrderIndex);
      
      // Sync across network
      socket.emit('taskMoved', {
        id: activeId,
        status: newStatus,
        order: newOrderIndex
      });
    }
  };

  return (
    <div className="flex justify-center w-full px-4 overflow-x-auto pb-10">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex justify-between items-center mb-8 mt-12">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Project Board</h1>
            <p className="text-gray-500 mt-1">Manage your team's tasks in real-time.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-6 md:items-start select-none">
            {columns.map((col) => (
              <TaskColumn
                key={col.id}
                status={col.id}
                title={col.title}
                tasks={tasks
                  .filter((t) => t.status === col.id)
                  .sort((a, b) => a.order - b.order)}
                onEditTask={handleOpenEditModal}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 rotate-2 scale-105 transition-transform shadow-2xl">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitModal}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
