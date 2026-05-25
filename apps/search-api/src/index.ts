import { Server } from "http";

import { CONFIG } from "./CONFIG";
import { createServer } from "./server";

const port = CONFIG.PORT || 3000;
const server = createServer(port);

run(server).catch(err => {
  console.error(err);
});

async function gracefulShutdown(serverInstance: Server) {
  try {
    console.info("Closing HTTP server...");
    await serverInstance.close();

    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    console.info("Server shut down gracefully.");
  }
  catch(error) {
    console.error("Error during graceful shutdown:", error);
  }
}

console.info("Starting server...");

async function run(httpServer: Server) {
  console.info(`Server listening on port ${port}`);

  process.on("SIGTERM", () => {
    void (async() => {
      try {
        console.info("Received SIGTERM signal, shutting down gracefully...");
        await gracefulShutdown(httpServer);
      }
      catch(error) {
        console.error(error);
      }
    })();
  });

  process.on("SIGINT", () => {
    void (async() => {
      try {
        console.info("Received SIGINT signal, shutting down gracefully...");
        await gracefulShutdown(httpServer);
      }
      catch(error) {
        console.error(error);
      }
    })();
  });
}
