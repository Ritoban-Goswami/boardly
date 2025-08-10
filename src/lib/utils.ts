import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to get initials from display name or email
export const getInitials = (user: User | null) => {
  if (!user) return "U";

  // Try to get initials from displayName
  if (user.displayName) {
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  // Fallback to first letter of email
  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return "U";
};

// Function to generate a consistent color from a string
export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a pastel color
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};
