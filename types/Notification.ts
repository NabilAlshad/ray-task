export type NotificationVariant = "success" | "info" | "warning" | "danger";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
};

export type NotificationInput = Omit<AppNotification, "id">;
