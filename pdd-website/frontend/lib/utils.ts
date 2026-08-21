import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Shared utility for conditional Tailwind class merging.
 * Engineered for 'Titanium' UI responsiveness.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
