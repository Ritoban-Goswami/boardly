"use client";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pb-8 pt-4">
        <KanbanBoard />
      </main>
    </div>
  );
}
