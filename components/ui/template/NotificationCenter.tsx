"use client";

import { X } from "lucide-react";
import { NOTIFICATION_VARIANT_STYLES } from "../../../data/constants";
import { useNotificationStore } from "@/store/useNotificationStore";
import { cn } from "@/lib/utils/helpers";

export function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(100%-2rem,24rem)] flex-col gap-3"
    >
      {notifications.map((notification) => {
        const style = NOTIFICATION_VARIANT_STYLES[notification.variant];
        const Icon = style.icon;

        return (
          <div
            key={notification.id}
            role={
              notification.variant === "danger" ||
              notification.variant === "warning"
                ? "alert"
                : "status"
            }
            className={cn(
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 animate-in slide-in-from-top-2",
              style.container,
            )}
          >
            <div className="flex items-start gap-3">
              <span className={cn("mt-0.5 rounded-full p-1.5", style.badge)}>
                <Icon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="mt-1 text-sm/5 opacity-80">
                  {notification.message}
                </p>
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
