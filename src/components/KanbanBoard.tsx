// components/KanbanBoard.tsx
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import DeleteDialog from "./DeleteDialog";
import TaskDialog from "./TaskDialog";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { usePresenceStore } from "@/store/usePresence";
import { auth } from "@/lib/firebase";
import { useTypingStore } from "@/store/useTyping";
import { useTasksStore } from "@/store/useTasks";

const columns = [
  { id: "todo", title: "To Do", accent: "blue" },
  { id: "in_progress", title: "In Progress", accent: "yellow" },
  { id: "done", title: "Done", accent: "green" },
];

export default function KanbanBoard() {
  const { tasks, updateTask, deleteTask, addTask } = useTasksStore();
  const { initListener: initPresence, setUserOnline } = usePresenceStore();
  const { typing, initListener: initTyping, setTyping } = useTypingStore();

  const [dialogColumn, setDialogColumn] = useState<ColumnId>("todo");
  const [dialogTask, setDialogTask] = useState<Task>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const unsub = useTasksStore.getState().initListener();
    return () => unsub();
  }, []);

  useEffect(() => {
    // Set presence
    if (auth.currentUser) {
      setUserOnline(
        auth.currentUser.uid,
        auth.currentUser.email || "Anonymous"
      );
    }

    // Listen for presence
    const unsubPresence = initPresence();

    // Listen for typing on a given task
    const unsubTyping = initTyping("taskId1");

    return () => {
      unsubPresence();
      unsubTyping();
    };
  }, []);

  console.log("typing", typing);

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
            />
          ))}
        </div>
      </DragDropContext>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialTitle={dialogTask?.title ?? ""}
        initialDescription={dialogTask?.description ?? ""}
        initialLabels={dialogTask?.labels ?? []}
        initialPriority={dialogTask?.priority ?? "medium"}
        onSubmit={handleSave}
        column={dialogColumn}
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
  },
  ref: React.Ref<HTMLDivElement>
) {
  const { id, title, accent, tasks, onAdd, onEdit, onDelete } = props;
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
