"use client";

import { create } from "zustand";
import type { AppNotification, NotificationInput } from "@/types";

type NotificationStore = {
  notifications: AppNotification[];
  addNotification: (notification: NotificationInput) => string;
  removeNotification: (id: string) => void;
};

const NOTIFICATION_DURATION_MS = 4000;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).slice(2, 10);
    const nextNotification: AppNotification = { id, ...notification };

    set((state) => ({
      notifications: [...state.notifications, nextNotification],
    }));

    globalThis.setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((item) => item.id !== id),
      }));
    }, NOTIFICATION_DURATION_MS);

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((item) => item.id !== id),
    }));
  },
}));
