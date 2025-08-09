"use client";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useTasksStore } from "@/store/useTasks";
import KanbanBoard from "@/components/KanbanBoard";
import AddTaskForm from "@/components/AddTaskForm";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const unsub = useTasksStore.getState().initListener();
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh bg-gray-50">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Navbar />
        <main className="container mx-auto px-4 pb-8 pt-4">
          <KanbanBoard />
        </main>
        <AddTaskForm />
      </main>
    </div>
  );
}
