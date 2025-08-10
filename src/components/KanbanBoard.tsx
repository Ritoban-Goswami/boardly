// components/KanbanBoard.tsx
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import React, { useEffect, useState, useMemo } from "react";
import TaskCard from "./TaskCard";
import DeleteDialog from "./DeleteDialog";
import TaskDialog from "./TaskDialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { useTasksStore } from "@/store/useTasks";
import { useTypingStore } from "@/store/useTyping";
import { auth } from "@/lib/firebase";
import { usePresenceStore } from "@/store/usePresence";

const columns = [
  { id: "todo", title: "To Do", accent: "blue" },
  { id: "in_progress", title: "In Progress", accent: "yellow" },
  { id: "done", title: "Done", accent: "green" },
];

export default function KanbanBoard() {
  const { tasks, updateTask, deleteTask, addTask } = useTasksStore();

  const [dialogColumn, setDialogColumn] = useState<ColumnId>("todo");
  const [dialogTask, setDialogTask] = useState<Task>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { typing: allUsersViewing, setTyping } = useTypingStore();
  const { presence } = usePresenceStore();

  useEffect(() => {
    // Only set typing status if we have a valid task ID
    if (!dialogTask?.id) return;

    // Set typing status when dialog opens/closes
    setTyping(dialogTask.id, dialogOpen);

    // Cleanup function to ensure typing status is cleared when component unmounts
    return () => {
      if (dialogOpen) {
        setTyping(dialogTask.id, false);
      }
    };
  }, [dialogOpen, dialogTask?.id, setTyping]);

  useEffect(() => {
    const unsub = useTasksStore.getState().initListener();
    return () => unsub();
  }, []);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) {
      updateTask(draggableId, { status: destination.droppableId });
    }
  };

  function openAdd(column: ColumnId) {
    setDialogMode("add");
    setDialogTask(null);
    setDialogColumn(column);
    setDialogOpen(true);
  }

  function openEdit(column: ColumnId, task: Task) {
    setDialogMode("edit");
    setDialogTask(task);
    setDialogColumn(column);
    setDialogOpen(true);
  }

  function requestDelete(column: ColumnId, task: Task) {
    setDialogColumn(column);
    setDialogTask(task);
    setDeleteOpen(true);
  }

  function confirmDelete() {
    if (!dialogTask) return;
    deleteTask(dialogTask.id);
    setDeleteOpen(false);
  }

  async function handleSave(values: Partial<Task>) {
    if (dialogMode === "add") {
      await addTask({
        ...values,
        status: dialogColumn,
      });
    } else if (dialogMode === "edit" && dialogTask) {
      await updateTask(dialogTask.id, values);
    }
    setDialogOpen(false);
  }

  // Create a mapping of taskId to array of user info objects
  const taskViewers = useMemo(() => {
    const result: Record<
      string,
      Array<{ id: string; displayName: string }>
    > = {};

    Object.entries(allUsersViewing).forEach(([taskId, viewers]) => {
      result[taskId] = Object.entries(viewers || {})
        .filter(
          ([userId, isViewing]) => isViewing && userId !== auth.currentUser?.uid
        )
        .map(([userId]) => ({
          id: userId,
          displayName: presence[userId]?.displayName || "User",
        }));
    });

    return result;
  }, [allUsersViewing, presence]);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              id={col.id}
              title={col.title}
              accent={col.accent}
              tasks={tasks.filter((t) => t.status === col.id)}
              onAdd={() => openAdd(col.id)}
              onEdit={(task) => openEdit(col.id, task)}
              onDelete={(task) => requestDelete(col.id, task)}
              taskViewers={taskViewers}
            />
          ))}
        </div>
      </DragDropContext>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialTask={dialogTask}
        onSubmit={handleSave}
        column={dialogColumn}
        usersViewing={taskViewers[dialogTask?.id] || []}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={dialogTask?.title ?? ""}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const BoardColumn = React.forwardRef(function BoardColumn(
  props: {
    id: ColumnId;
    title: string;
    accent: "blue" | "yellow" | "green";
    tasks: Task[];
    onAdd: () => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    taskViewers: any;
  },
  ref: React.Ref<HTMLDivElement>
) {
  const { id, title, accent, tasks, onAdd, onEdit, onDelete, taskViewers } =
    props;
  const accentClasses = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "text-blue-700",
      button: "hover:bg-blue-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      title: "text-yellow-700",
      button: "hover:bg-yellow-100",
    },
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      title: "text-green-700",
      button: "hover:bg-green-100",
    },
  }[accent];

  return (
    <div
      className={cn("snap-center snap-always w-[88%] shrink-0 md:w-auto")}
      id={id}
      ref={ref}
    >
      <div
        className={cn(
          "rounded-lg border",
          accentClasses.border,
          accentClasses.bg
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <h2 className={cn("text-sm font-semibold", accentClasses.title)}>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAdd}
              className={cn(
                "h-8 gap-1 rounded-md text-xs active:scale-[0.98] transition",
                accentClasses.button
              )}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        <Droppable droppableId={id} type="TASK">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex max-h-[70svh] flex-col gap-2 overflow-y-auto px-3 pb-3 pt-1"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="cursor-pointer"
                    >
                      <TaskCard
                        task={task}
                        usersViewing={taskViewers[task.id] || []}
                        onEdit={() => onEdit(task)}
                        onDelete={() => onDelete(task)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No tasks yet
                </div>
              ) : null}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
});
