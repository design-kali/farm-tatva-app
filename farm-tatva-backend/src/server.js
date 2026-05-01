import "dotenv/config";
import http from "http";
import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS || 65_000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 66_000);
server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS || 30_000);

server.on("clientError", (err, socket) => {
  try {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  } catch (_e) {
    // ignore
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let isShuttingDown = false;
const shutdown = async (reason) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.error(`[shutdown] starting (${reason})`);

  const forceExitTimer = setTimeout(() => {
    console.error("[shutdown] forcing exit");
    process.exit(1);
  }, Number(process.env.SHUTDOWN_TIMEOUT_MS || 15_000));
  forceExitTimer.unref();

  await new Promise((resolve) => server.close(resolve));

  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error("[shutdown] prisma disconnect failed:", err);
  }

  console.error("[shutdown] complete");
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
  shutdown("unhandledRejection");
});
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  shutdown("uncaughtException");
});
