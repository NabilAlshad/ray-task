export const USER_ROLES = ["ADMIN", "MEMBER", "VIEWER"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export const USER_ROLE_PERMISSIONS: Record<
  UserRole,
  {
    create: boolean;
    update: boolean;
    delete: boolean;
    move: boolean;
  }
> = {
  ADMIN: {
    create: true,
    update: true,
    delete: true,
    move: true,
  },
  MEMBER: {
    create: true,
    update: true,
    delete: false,
    move: true,
  },
  VIEWER: {
    create: false,
    update: false,
    delete: false,
    move: false,
  },
};

export type User = {
  id: string;
  name: string;
  color: string;
  role: UserRole;
};

export type UserDirectoryEntry = {
  id: string;
  name: string;
  color: string;
  role: UserRole;
};

export type UserDirectoryAction = "create" | "delete";

export function canCreateTask(role: UserRole) {
  return USER_ROLE_PERMISSIONS[role].create;
}

export function canUpdateTask(role: UserRole) {
  return USER_ROLE_PERMISSIONS[role].update;
}

export function canDeleteTask(role: UserRole) {
  return USER_ROLE_PERMISSIONS[role].delete;
}

export function canMoveTask(role: UserRole) {
  return USER_ROLE_PERMISSIONS[role].move;
}
