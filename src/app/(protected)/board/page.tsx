import { redirect } from 'next/navigation';

// This is a Server Component - it runs on the server
export default function BoardRedirect() {
  // For now, we'll redirect to default board
  // TODO: Add server-side auth checking when implementing full auth
  redirect('/board/1');
}
