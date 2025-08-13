'use client';

import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';
import { CheckSquare } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2">
            <CheckSquare
              className="size-10 text-primary animate-bounce"
              style={{
                animationDuration: '2s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
              }}
            />
            <h1 className="text-2xl font-bold text-foreground">Boardly</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null; // prevent flicker

  return <>{children}</>;
}
