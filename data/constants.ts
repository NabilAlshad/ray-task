import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { NotificationVariant } from "@/types";

export interface NotificationVariantStyle {
  container: string;
  badge: string;
  icon: LucideIcon;
}

export const NOTIFICATION_VARIANT_STYLES: Record<
  NotificationVariant,
  NotificationVariantStyle
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-950",
    badge: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
  },
  info: {
    container: "border-blue-200 bg-blue-50 text-blue-950",
    badge: "bg-blue-100 text-blue-700",
    icon: Info,
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-950",
    badge: "bg-amber-100 text-amber-700",
    icon: AlertTriangle,
  },
  danger: {
    container: "border-red-200 bg-red-50 text-red-950",
    badge: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

// Live users constants (from components/ui/compound/live-users/constants.ts)
import initialDirectoryUsers from "@/data/users.json";
import type { UserDirectoryEntry, UserRole } from "@/types";

export const INITIAL_DIRECTORY_USERS =
  initialDirectoryUsers as UserDirectoryEntry[];

export const ROLE_STYLES = {
  ADMIN: "bg-red-700 text-white border border-red-700",
  MEMBER: "bg-blue-700 text-white border border-blue-700",
  VIEWER: "bg-slate-700 text-white border border-slate-700",
} as const;

export const USER_STORAGE_KEY = "task-board-current-user";

export const DEFAULT_USER_COLOR = "bg-red-500";

export const DEFAULT_USER_ROLE: UserRole = "VIEWER";

export const FALLBACK_CREATED_USER_NAME = "Guest";

export const LIVE_COLLABORATION_TITLE = "Live Collaboration";

export const CONNECTING_LABEL = "Connecting...";

export const YOUR_PROFILE_TITLE = "Your Profile";

export const ACCESS_SUMMARY_BY_ROLE: Record<UserRole, string> = {
  ADMIN: "Full access",
  MEMBER: "Can create, edit, and move",
  VIEWER: "Read-only",
};

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
