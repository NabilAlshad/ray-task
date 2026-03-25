"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
  X,
  XCircle,
} from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils/helpers";
import type { NotificationVariant } from "@/types";

interface NotificationVariantStyle {
  container: string;
  badge: string;
  icon: LucideIcon;
}

const VARIANT_STYLES: Record<NotificationVariant, NotificationVariantStyle> = {
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

export function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,24rem)] flex-col gap-3">
      {notifications.map((notification) => {
        const style = VARIANT_STYLES[notification.variant];
        const Icon = style.icon;

        return (
          <div
            key={notification.id}
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 animate-in slide-in-from-top-2",
              style.container
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cn("mt-0.5 rounded-full p-1.5", style.badge)}>
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="mt-1 text-sm/5 opacity-80">{notification.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeNotification(notification.id)}
                className="rounded-full p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
