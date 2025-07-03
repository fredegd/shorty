import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the base URL for the application
export function getBaseUrl(): string {
  // In production, use the production domain
  if (process.env.NODE_ENV === "production") {
    return "https://lisho.vercel.app";
  }

  // In development, use localhost
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Fallback for server-side rendering in development
  return "http://localhost:3000";
}
