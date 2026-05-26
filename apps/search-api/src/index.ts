import { type Server } from "http";

import { app } from "./app";
import { CONFIG } from "./CONFIG";
import { isTestingEnvironment } from "./utils/general";
import { logger } from "./utils/logger";

const port = CONFIG.PORT;
const server = app.listen(port, () => {
  const baseUrl = `http://127.0.0.1:${port}`;

  logger.info(`Server listening on port ${port}`);

  if (isTestingEnvironment()) {
    logger.info(`Test server at ${baseUrl}`);
    logger.info(`Swagger UI at ${baseUrl}/testing/api-docs`);
  }
}) as Server;

run(server).catch(err => {
  console.error(err);
});

async function gracefulShutdown(serverInstance: Server) {
  try {
    logger.info("Closing HTTP server...");
    await new Promise<void>((resolve, reject) => {
      serverInstance.close(error => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    logger.info("Server shut down gracefully.");
  }
  catch(error) {
    logger.error({ err: error }, "Error during graceful shutdown");
  }
}

async function run(httpServer: Server) {
  process.on("SIGTERM", () => {
    void (async() => {
      try {
        logger.info("Received SIGTERM signal, shutting down gracefully...");
        await gracefulShutdown(httpServer);
      }
      catch(error) {
        logger.error({ err: error }, "SIGTERM shutdown failed");
      }
    })();
  });

  process.on("SIGINT", () => {
    void (async() => {
      try {
        logger.info("Received SIGINT signal, shutting down gracefully...");
        await gracefulShutdown(httpServer);
      }
      catch(error) {
        logger.error({ err: error }, "SIGINT shutdown failed");
      }
    })();
  });
}
