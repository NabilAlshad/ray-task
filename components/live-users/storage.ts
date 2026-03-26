import { USER_ROLES, type User, type UserDirectoryEntry } from "@/types";
import {
  COLOR_OPTIONS,
  INITIAL_DIRECTORY_USERS,
  USER_STORAGE_KEY,
  type UserColorOption,
} from "@/data/constants";

export function createRandomUser(
  directoryUsers: UserDirectoryEntry[] = INITIAL_DIRECTORY_USERS,
): User {
  const sourceUsers =
    directoryUsers.length > 0 ? directoryUsers : INITIAL_DIRECTORY_USERS;
  const randomUser =
    sourceUsers[Math.floor(Math.random() * sourceUsers.length)];

  return {
    id: "",
    name: randomUser.name,
    color: randomUser.color,
    role: randomUser.role,
  };
}

export function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUser) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser) as Partial<User>;
    if (
      typeof parsedUser?.name !== "string" ||
      !parsedUser.name.trim() ||
      typeof parsedUser?.color !== "string" ||
      !COLOR_OPTIONS.includes(parsedUser.color as UserColorOption) ||
      !USER_ROLES.includes(parsedUser.role as (typeof USER_ROLES)[number])
    ) {
      return null;
    }

    return {
      id: "",
      name: parsedUser.name.trim(),
      color: parsedUser.color,
      role: parsedUser.role,
    } as User;
  } catch {
    return null;
  }
}

export function persistUser(user: User) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({
      name: user.name,
      color: user.color,
      role: user.role,
    }),
  );
}

export function mergeUsers(users: User[]) {
  return users.reduce<User[]>((acc, current) => {
    const existingUserIndex = acc.findIndex((item) => item.id === current.id);
    if (existingUserIndex === -1) {
      return acc.concat([current]);
    }

    const nextUsers = [...acc];
    nextUsers[existingUserIndex] = current;
    return nextUsers;
  }, []);
}
