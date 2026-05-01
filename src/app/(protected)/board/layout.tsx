'use client';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from '@/components/Navbar';
import BoardSwitcher from '@/components/BoardSwitcher';

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <div className="flex h-[calc(100dvh-56px)]">
        <BoardSwitcher />
        {children}
      </div>
    </div>
  );
}
