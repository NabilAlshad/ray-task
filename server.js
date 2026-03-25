import fs from "fs";
import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const boardRoom = "task-board";
const recoveryWindowMs = 2 * 60 * 1000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
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

  const DB_PATH = "./data/tasks.json";
  const defaultTasks = [
    {
      id: "1",
      title: "Design the homepage layout",
      description: "Create wireframes and mockups",
      status: "DONE",
      order: 0,
    },
    {
      id: "2",
      title: "Build the TaskCard component",
      description: "Implement drag and drop functionality",
      status: "DONE",
      order: 1,
    },
    {
      id: "3",
      title: "Integrate API endpoints",
      description: "Connect frontend to backend",
      status: "IN_PROGRESS",
      order: 0,
    },
    {
      id: "4",
      title: "Write unit tests",
      description: "Ensure code quality",
      status: "IN_PROGRESS",
      order: 1,
    },
    {
      id: "5",
      title: "Deploy to production",
      description: "Set up hosting and domains",
      status: "TODO",
      order: 0,
    },
    {
      id: "6",
      title: "Set up CI/CD pipeline",
      description: "Automate testing and deployment",
      status: "TODO",
      order: 1,
    },
  ];

  const getTasksFromDB = () => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}

    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultTasks, null, 2));
    } catch {}

    return [...defaultTasks];
  };

  const saveTasksToDB = (tasks) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2));
  };
  const pendingUserLeaves = new Map();

  const getActiveUsers = () => {
    return [...io.of("/").sockets.values()]
      .filter((clientSocket) => clientSocket.rooms.has(boardRoom) && clientSocket.data.user)
      .map((clientSocket) => clientSocket.data.user);
  };

  let currentTasks = getTasksFromDB();

  io.on("connection", (socket) => {
    socket.join(boardRoom);

    if (socket.data.user?.id && pendingUserLeaves.has(socket.data.user.id)) {
      clearTimeout(pendingUserLeaves.get(socket.data.user.id));
      pendingUserLeaves.delete(socket.data.user.id);
    }

    console.log(
      socket.recovered ? "Client reconnected with recovery:" : "Client connected:",
      socket.id,
    );

    if (socket.recovered) {
      if (socket.data.user) {
        socket.to(boardRoom).emit("userJoined", socket.data.user);
      }

      socket.emit(
        "activeUsers",
        getActiveUsers().filter((user) => user.id !== socket.data.user?.id),
      );
    } else {
      socket.emit("initTasks", currentTasks);
      socket.emit(
        "activeUsers",
        getActiveUsers().filter((user) => user.id !== socket.id),
      );
    }

    socket.on("taskMoved", (data) => {
      const taskIndex = currentTasks.findIndex((task) => task.id === data.id);
      if (taskIndex !== -1) {
        const updatedTasks = [...currentTasks];
        const [task] = updatedTasks.splice(taskIndex, 1);
        const movedTask = { ...task, status: data.status };

        const columnTasks = updatedTasks
          .filter((item) => item.status === data.status)
          .sort((a, b) => a.order - b.order);

        columnTasks.splice(data.order, 0, movedTask);
        columnTasks.forEach((item, index) => {
          item.order = index;
        });

        currentTasks = [
          ...updatedTasks.filter((item) => item.status !== data.status),
          ...columnTasks,
        ];
        saveTasksToDB(currentTasks);
      }

      socket.to(boardRoom).emit("taskMoved", data);
    });

    socket.on("taskAdded", (newTask) => {
      currentTasks.push(newTask);
      saveTasksToDB(currentTasks);
      socket.to(boardRoom).emit("taskAdded", newTask);
    });

    socket.on("taskUpdated", (updatedTask) => {
      currentTasks = currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      saveTasksToDB(currentTasks);
      socket.to(boardRoom).emit("taskUpdated", updatedTask);
    });

    socket.on("taskDeleted", (id) => {
      currentTasks = currentTasks.filter((task) => task.id !== id);
      saveTasksToDB(currentTasks);
      socket.to(boardRoom).emit("taskDeleted", id);
    });

    socket.on("userJoined", (user) => {
      socket.data.user = user;
      if (pendingUserLeaves.has(user.id)) {
        clearTimeout(pendingUserLeaves.get(user.id));
        pendingUserLeaves.delete(user.id);
      }
      socket.to(boardRoom).emit("userJoined", user);
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

  server.once("error", (error) => {
    console.error(error);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
