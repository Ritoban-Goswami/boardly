// components/KanbanBoard.tsx
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import React, { useEffect, useState, useMemo } from 'react';
import TaskCard from './TaskCard';
import DeleteDialog from './DeleteDialog';
import TaskDialog from './TaskDialog';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useTasksStore } from '@/store/useTasks';
import { auth } from '@/lib/firebase';
import { usePresenceStore } from '@/store/usePresence';
import { useUsersStore } from '@/store/useUsers';
import { useNotificationsStore } from '@/store/useNotifications';

const columns = [
  { id: 'todo' as const, title: 'To Do', accent: 'blue' as const },
  { id: 'in-progress' as const, title: 'In Progress', accent: 'yellow' as const },
  { id: 'done' as const, title: 'Done', accent: 'green' as const },
];

export default function KanbanBoard() {
  const { tasks, updateTask, deleteTask, addTask } = useTasksStore();
  const [dialogColumn, setDialogColumn] = useState<ColumnId>('todo');
  const [dialogTask, setDialogTask] = useState<Task>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { presence, setTyping } = usePresenceStore();

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
    const unsubTasks = useTasksStore.getState().initListener();
    const unsubUsers = useUsersStore.getState().initListener();
    const unsubNotifications =
      (auth.currentUser?.uid &&
        useNotificationsStore.getState().initListener(auth.currentUser.uid)) ||
      (() => {});
    return () => {
      unsubTasks();
      unsubUsers();
      unsubNotifications();
    };
  }, []);

  const getTasksForColumn = (status: ColumnId, excludeTaskId?: string): Task[] => {
    return tasks
      .filter((task) => task.status === status && task.id !== excludeTaskId)
      .sort((a, b) => a.order - b.order);
  };

  const createTaskUpdate = (
    task: Task,
    newOrder: number,
    options?: { updateStatus?: boolean; newStatus?: ColumnId }
  ): TaskUpdate => ({
    id: task.id,
    updates: {
      ...(options?.updateStatus && { status: options.newStatus }),
      order: newOrder,
    },
  });

  const updateTaskOrders = async (updates: TaskUpdate[]): Promise<void> => {
    if (updates.length === 0) return;

    try {
      await Promise.all(updates.map(({ id, updates }) => updateTask(id, updates)));
    } catch (error) {
      console.error('Error updating task orders:', error);
      throw error;
    }
  };

  const onDragEnd = async (result: DropResult): Promise<void> => {
    const { destination, source, draggableId } = result;

    // Ignore if dropped outside a valid destination or in the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    const movedTask = tasks.find((task) => task.id === draggableId);
    if (!movedTask) return;

    const sourceColumn = source.droppableId as ColumnId;
    const destinationColumn = destination.droppableId as ColumnId;
    const isSameColumn = sourceColumn === destinationColumn;

    // Get tasks for the destination column and insert the moved task
    const destinationTasks = getTasksForColumn(destinationColumn, draggableId);
    destinationTasks.splice(destination.index, 0, {
      ...movedTask,
      status: destinationColumn,
    });

    // Prepare updates for all affected tasks in the destination column
    const updates = destinationTasks
      // Only include tasks that changed position or the moved task
      .filter((task, index) => task.id === movedTask.id || task.order !== index)
      .map((task) =>
        createTaskUpdate(task, destinationTasks.indexOf(task), {
          updateStatus: task.id === movedTask.id,
          newStatus: destinationColumn,
        })
      );

    // If moving between columns, update the source column as well
    if (!isSameColumn) {
      const sourceTasks = getTasksForColumn(sourceColumn, draggableId);

      // Update orders for remaining tasks in the source column
      sourceTasks.forEach((task, index) => {
        if (task.order !== index) {
          updates.push(createTaskUpdate(task, index));
        }
      });
    }

    // Apply all updates
    await updateTaskOrders(updates);
  };

  function openAdd(column: ColumnId) {
    setDialogMode('add');
    setDialogTask(undefined);
    setDialogColumn(column);
    setDialogOpen(true);
  }

  function openEdit(column: ColumnId, task: Task) {
    setDialogMode('edit');
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
    if (dialogMode === 'add') {
      // Get all tasks in the target column and sort them by order
      const columnTasks = tasks
        .filter((t) => t.status === dialogColumn)
        .sort((a, b) => a.order - b.order);

      // Calculate new order (start with 0 if no tasks, or add 1 to the last task's order)
      const newOrder = columnTasks.length > 0 ? columnTasks[columnTasks.length - 1].order + 1 : 0;

      await addTask({
        title: values.title ?? '',
        description: values.description ?? '',
        status: dialogColumn,
        priority: values.priority ?? 'medium',
        labels: values.labels ?? [],
        assignedTo: values.assignedTo ?? '',
        order: newOrder,
      });
    } else if (dialogMode === 'edit' && dialogTask) {
      await updateTask(dialogTask.id, values);
    }

    setDialogOpen(false);
  }

  // Create a mapping of taskId to array of user info objects
  const taskViewers = useMemo(() => {
    const result: Record<string, Array<{ id: string; displayName: string }>> = {};

    // Create mapping from presence data using currentTaskViewing field
    Object.entries(presence)
      .filter(
        ([userId, userData]) => userData.currentTaskViewing && userId !== auth.currentUser?.uid
      )
      .forEach(([userId, userData]) => {
        const taskId = userData.currentTaskViewing!;
        (result[taskId] ??= []).push({
          id: userId,
          displayName: userData.displayName || 'User',
        });
      });

    return result;
  }, [presence]);

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full overflow-x-auto pb-4 px-4">
          <div className="inline-flex justify-center items-start w-auto min-w-full gap-4">
            {columns.map((col) => (
              <BoardColumn
                key={col.id}
                id={col.id}
                title={col.title}
                accent={col.accent}
                tasks={tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order)}
                onAdd={() => openAdd(col.id)}
                onEdit={(task) => openEdit(col.id, task)}
                onDelete={(task) => requestDelete(col.id, task)}
                taskViewers={taskViewers}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialTask={dialogTask ?? null}
        onSubmit={handleSave}
        column={dialogColumn}
        usersViewing={dialogTask?.id ? taskViewers[dialogTask.id] || [] : []}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={dialogTask?.title ?? ''}
        onConfirm={confirmDelete}
      />
    </>
  );
}

const BoardColumn = React.forwardRef(function BoardColumn(
  props: {
    id: ColumnId;
    title: string;
    accent: 'blue' | 'yellow' | 'green';
    tasks: Task[];
    onAdd: () => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    taskViewers: Record<string, TaskViewer[]>;
  },
  ref: React.Ref<HTMLDivElement>
) {
  const { id, title, accent, tasks, onAdd, onEdit, onDelete, taskViewers } = props;
  const accentClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800/50',
      title: 'text-blue-700 dark:text-blue-300',
      button: 'hover:bg-blue-100 dark:hover:bg-blue-900/50',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800/50',
      title: 'text-yellow-700 dark:text-yellow-300',
      button: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/50',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800/50',
      title: 'text-green-700 dark:text-green-300',
      button: 'hover:bg-green-100 dark:hover:bg-green-900/50',
    },
  }[accent];

  return (
    <div className="w-[280px] xl:w-[350px] flex-shrink-0" id={id} ref={ref}>
      <div
        className={cn(
          'rounded-2xl border h-full flex flex-col',
          accentClasses.border,
          accentClasses.bg
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <h2 className={cn('text-sm font-semibold', accentClasses.title)}>{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAdd}
              className={cn(
                'h-8 gap-1 rounded-md text-xs active:scale-[0.98] transition',
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
              className="flex flex-col gap-2 px-2 pb-2 flex-1 min-h-[100px]"
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
                <div className="py-8 text-center text-sm text-muted-foreground">No tasks yet</div>
              ) : null}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
});
