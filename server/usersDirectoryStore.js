import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultUsersPath = path.resolve(currentDir, "../data/users.json");

export function isValidUserRole(role) {
  return role === "ADMIN" || role === "MEMBER" || role === "VIEWER";
}

export function normalizeDirectoryUser(user) {
  const name = typeof user?.name === "string" && user.name.trim() ? user.name.trim() : "Guest";
  const color =
    typeof user?.color === "string" && user.color.trim() ? user.color.trim() : "bg-slate-500";

  return {
    id: typeof user?.id === "string" && user.id.trim() ? user.id.trim() : randomUUID(),
    name,
    color,
    role: isValidUserRole(user?.role) ? user.role : "VIEWER",
  };
}

function readDefaultUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(defaultUsersPath, "utf-8"));
    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeDirectoryUser);
    }
  } catch {}

  return [];
}

function readUsersFromDisk(dbPath) {
  const defaultUsers = readDefaultUsers();

  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeDirectoryUser);
      }
    }
  } catch {}

  try {
    fs.writeFileSync(dbPath, JSON.stringify(defaultUsers, null, 2));
  } catch {}

  return [...defaultUsers];
}

function saveUsersToDisk(dbPath, users) {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
}

export function createUsersDirectoryStore(dbPath) {
  let currentUsers = readUsersFromDisk(dbPath);

  return {
    getAll() {
      return currentUsers;
    },
    create(user) {
      const normalizedUser = normalizeDirectoryUser(user);
      const existingUser = currentUsers.find(
        (currentUser) => currentUser.name.toLowerCase() === normalizedUser.name.toLowerCase(),
      );

      if (existingUser) {
        return {
          ok: false,
          error: `A saved user named "${normalizedUser.name}" already exists.`,
        };
      }

      currentUsers = [...currentUsers, normalizedUser].sort((leftUser, rightUser) =>
        leftUser.name.localeCompare(rightUser.name),
      );
      saveUsersToDisk(dbPath, currentUsers);

      return { ok: true, user: normalizedUser };
    },
    delete(userId) {
      const userToDelete = currentUsers.find((user) => user.id === userId);

      if (!userToDelete) {
        return {
          ok: false,
          error: "The selected saved user no longer exists.",
        };
      }

      if (
        userToDelete.role === "ADMIN" &&
        currentUsers.filter((user) => user.role === "ADMIN").length === 1
      ) {
        return {
          ok: false,
          error: "At least one admin must remain in the saved user list.",
        };
      }

      currentUsers = currentUsers.filter((user) => user.id !== userId);
      saveUsersToDisk(dbPath, currentUsers);

      return {
        ok: true,
        user: {
          id: userToDelete.id,
          name: userToDelete.name,
        },
      };
    },
  };
}
