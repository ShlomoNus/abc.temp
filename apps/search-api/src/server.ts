import { type IncomingMessage, type ServerResponse, type Server, createServer as httpCreateService } from "http";

import compression from "compression";
import express, { json } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { cspByPath } from "./middleware/cspByPath";
import { searchRouter } from "./routes/searchRouter";
import { testingRouter } from "./routes/testingRouter";
import { logger } from "./utils/logger";

const app = express();

export function createServer(port: number): Server {
  app.use(json());

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cspByPath);
  app.use(compression());

  app.use(pinoHttp({
    logger,
    serializers: {
      req(request: IncomingMessage) {
        return {
          method: request.method,
          url: request.url
        };
      },
      res(response: ServerResponse) {
        return {
          statusCode: response.statusCode
        };
      }
    }
  }));

  app.use(testingRouter);
  app.use(searchRouter);

  return httpCreateService(app).listen(port, () => {
    console.info(`Express with Typescript! http://localhost:${port}`);
  });
}
