import { createServer as createHttpServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
import { createTasksStore } from "./tasksStore.js";
import { createUsersDirectoryStore } from "./usersDirectoryStore.js";
import { registerSocketHandlers } from "./socketHandlers.js";

export function createAppServer() {
  const dev = process.env.NODE_ENV !== "production";
  const hostname = "localhost";
  const port = 3000;
  const boardRoom = "task-board";
  const recoveryWindowMs = 2 * 60 * 1000;
  const tasksDbPath = "./data/tasks.json";
  const usersDbPath = "./data/users.json";

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  return {
    hostname,
    port,
    async start() {
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

      registerSocketHandlers({
        io,
        boardRoom,
        recoveryWindowMs,
        tasksStore: createTasksStore(tasksDbPath),
        usersDirectoryStore: createUsersDirectoryStore(usersDbPath),
      });

      server.once("error", (error) => {
        console.error(error);
        process.exit(1);
      });

      server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
    },
  };
}
