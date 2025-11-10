import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a full name as "First Last Initial"
 * Example: "John Doe" -> "John D."
 * Example: "Jane" -> "Jane"
 */
export function formatNameForLeaderboard(
  name: string | null | undefined
): string {
  if (!name || name.trim().length === 0) {
    return "";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0];
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${firstName} ${lastInitial}.`;
}
