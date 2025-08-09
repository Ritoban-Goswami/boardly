import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <main className="min-h-dvh bg-gray-50">
        <div className="container mx-auto flex min-h-dvh items-center justify-center p-4">
          {children}
        </div>
      </main>
    </ProtectedRoute>
  );
}
