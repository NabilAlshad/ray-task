import initialDirectoryUsers from "@/data/users.json";
import type { UserDirectoryEntry } from "@/types";

export const INITIAL_DIRECTORY_USERS = initialDirectoryUsers as UserDirectoryEntry[];

export const ROLE_STYLES = {
  ADMIN: "bg-red-100 text-red-700",
  MEMBER: "bg-blue-100 text-blue-700",
  VIEWER: "bg-slate-100 text-slate-700",
} as const;

export const USER_STORAGE_KEY = "task-board-current-user";

export const COLOR_OPTIONS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500",
] as const;

export type UserColorOption = (typeof COLOR_OPTIONS)[number];
