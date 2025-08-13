import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Function to get initials from display name or email
export const getInitials = (
  user: { displayName?: string | null; email?: string | null } | null | undefined
) => {
  if (!user) return 'U';

  // Try to get initials from displayName
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Fallback to first letter of email
  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return 'U';
};

// Function to generate a consistent color from a string using Tailwind colors
export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Tailwind color palette (500-600 for light mode, 300-400 for dark mode)
  const colors = [
    'bg-blue-400 dark:bg-blue-300',
    'bg-emerald-400 dark:bg-emerald-300',
    'bg-purple-400 dark:bg-purple-300',
    'bg-amber-400 dark:bg-amber-300',
    'bg-rose-400 dark:bg-rose-300',
    'bg-indigo-400 dark:bg-indigo-300',
    'bg-teal-400 dark:bg-teal-300',
    'bg-pink-400 dark:bg-pink-300',
  ];

  // Pick a consistent color based on the hash
  return colors[Math.abs(hash) % colors.length];
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
