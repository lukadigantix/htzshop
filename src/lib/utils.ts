import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn `cn` (treba ga mapcn komponenta u components/ui/map.tsx)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
