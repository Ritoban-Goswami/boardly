import { useState } from "react";
import { useTasksStore } from "@/store/useTasks";

export default function AddTaskForm() {
  const [title, setTitle] = useState("");
  const addTask = useTasksStore((s) => s.addTask);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask({ title, status: "todo", createdBy: "userId_here" });
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task"
        className="border rounded px-2 py-1"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Add
      </button>
    </form>
  );
}
