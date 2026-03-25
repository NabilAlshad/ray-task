import { createServer as createHttpServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
import { createTasksStore } from "./tasksStore.js";
import {
  createUsersDirectoryStore,
  isValidUserRole,
} from "./usersDirectoryStore.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const boardRoom = "task-board";
const recoveryWindowMs = 2 * 60 * 1000;
const tasksDbPath = "./data/tasks.json";
const usersDbPath = "./data/users.json";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const tasksStore = createTasksStore(tasksDbPath);
const usersDirectoryStore = createUsersDirectoryStore(usersDbPath);

async function startServer() {
  await app.prepare();

  const server = createHttpServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (error) {
      console.error("Error occurred handling", req.url, error);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket"],
    connectionStateRecovery: {
      maxDisconnectionDuration: recoveryWindowMs,
      skipMiddlewares: true,
    },
  });

  registerSocketHandlers(io);

  server.once("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}

function registerSocketHandlers(io) {
  const pendingUserLeaves = new Map();

  const getActiveUsers = () => {
    return [...io.of("/").sockets.values()]
      .filter(
        (clientSocket) =>
          clientSocket.rooms.has(boardRoom) && clientSocket.data.user,
      )
      .map((clientSocket) => clientSocket.data.user);
  };

  const assignUserRole = () => {
    const activeRoles = new Set(getActiveUsers().map((user) => user.role));

    if (!activeRoles.has("ADMIN")) {
      return "ADMIN";
    }

    if (!activeRoles.has("MEMBER")) {
      return "MEMBER";
    }

    return "VIEWER";
  };

  const normalizeBoardUser = (user, socketId) => {
    const name =
      typeof user?.name === "string" && user.name.trim()
        ? user.name.trim()
        : "Guest";
    const color =
      typeof user?.color === "string" && user.color.trim()
        ? user.color.trim()
        : "bg-slate-500";

    return {
      id: socketId,
      name,
      color,
      role: isValidUserRole(user?.role) ? user.role : assignUserRole(),
    };
  };

  const hasTaskPermission = (user, action) => {
    if (!user) {
      return false;
    }

    if (user.role === "ADMIN") {
      return true;
    }

    if (user.role === "MEMBER") {
      return action !== "delete";
    }

    return false;
  };

  const denyTaskPermission = (socket, action, userRole) => {
    socket.emit("permissionDenied", {
      action,
      role: userRole || "VIEWER",
    });
    socket.emit("initTasks", tasksStore.getAll());
  };

  const emitUserDirectoryError = (socket, action, message) => {
    socket.emit("userDirectoryError", { action, message });
  };

  const syncUserDirectory = () => {
    io.to(boardRoom).emit("userDirectory", usersDirectoryStore.getAll());
  };

  io.on("connection", (socket) => {
    socket.join(boardRoom);

    if (socket.data.user?.id && pendingUserLeaves.has(socket.data.user.id)) {
      clearTimeout(pendingUserLeaves.get(socket.data.user.id));
      pendingUserLeaves.delete(socket.data.user.id);
    }

    console.log(
      socket.recovered
        ? "Client reconnected with recovery:"
        : "Client connected:",
      socket.id,
    );

    socket.emit("userDirectory", usersDirectoryStore.getAll());

    if (socket.recovered) {
      if (socket.data.user) {
        socket.emit("currentUser", socket.data.user);
        socket.to(boardRoom).emit("userJoined", socket.data.user);
      }

      socket.emit(
        "activeUsers",
        getActiveUsers().filter((user) => user.id !== socket.data.user?.id),
      );
    } else {
      socket.emit("initTasks", tasksStore.getAll());
      socket.emit(
        "activeUsers",
        getActiveUsers().filter((user) => user.id !== socket.id),
      );
    }

    socket.on("taskMoved", (data) => {
      if (!hasTaskPermission(socket.data.user, "move")) {
        denyTaskPermission(socket, "move", socket.data.user?.role);
        return;
      }

      tasksStore.move(data);
      socket.to(boardRoom).emit("taskMoved", data);
    });

    socket.on("taskAdded", (newTask) => {
      if (!hasTaskPermission(socket.data.user, "create")) {
        denyTaskPermission(socket, "create", socket.data.user?.role);
        return;
      }

      tasksStore.add(newTask);
      socket.to(boardRoom).emit("taskAdded", newTask);
    });

    socket.on("taskUpdated", (updatedTask) => {
      if (!hasTaskPermission(socket.data.user, "update")) {
        denyTaskPermission(socket, "update", socket.data.user?.role);
        return;
      }

      tasksStore.update(updatedTask);
      socket.to(boardRoom).emit("taskUpdated", updatedTask);
    });

    socket.on("taskDeleted", (taskId) => {
      if (!hasTaskPermission(socket.data.user, "delete")) {
        denyTaskPermission(socket, "delete", socket.data.user?.role);
        return;
      }

      tasksStore.delete(taskId);
      socket.to(boardRoom).emit("taskDeleted", taskId);
    });

    socket.on("userJoined", (user) => {
      const normalizedUser = normalizeBoardUser(user, socket.id);
      socket.data.user = normalizedUser;

      if (pendingUserLeaves.has(normalizedUser.id)) {
        clearTimeout(pendingUserLeaves.get(normalizedUser.id));
        pendingUserLeaves.delete(normalizedUser.id);
      }

      socket.emit("currentUser", normalizedUser);
      socket.to(boardRoom).emit("userJoined", normalizedUser);
    });

    socket.on("createUser", (user) => {
      if (socket.data.user?.role !== "ADMIN") {
        emitUserDirectoryError(
          socket,
          "create",
          "Only admins can create saved users.",
        );
        return;
      }

      const result = usersDirectoryStore.create(user);
      if (!result.ok) {
        emitUserDirectoryError(socket, "create", result.error);
        return;
      }

      syncUserDirectory();
      socket.emit("userCreated", result.user);
    });

    socket.on("deleteUser", (userId) => {
      if (socket.data.user?.role !== "ADMIN") {
        emitUserDirectoryError(
          socket,
          "delete",
          "Only admins can delete saved users.",
        );
        return;
      }

      const result = usersDirectoryStore.delete(userId);
      if (!result.ok) {
        emitUserDirectoryError(socket, "delete", result.error);
        return;
      }

      syncUserDirectory();
      socket.emit("userDeleted", result.user);
    });

    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", socket.id, reason);

      const userId = socket.data.user?.id || socket.id;
      if (reason === "client namespace disconnect") {
        socket.to(boardRoom).emit("userLeft", userId);
        return;
      }

      const leaveTimer = setTimeout(() => {
        pendingUserLeaves.delete(userId);
        socket.to(boardRoom).emit("userLeft", userId);
      }, recoveryWindowMs);

      pendingUserLeaves.set(userId, leaveTimer);
    });
  });
}

startServer();
