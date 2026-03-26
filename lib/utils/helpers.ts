import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/)

  if (words.length <= maxWords) {
    return text
  }

  return `${words.slice(0, maxWords).join(" ")}...`
}
