import { type IncomingMessage, type ServerResponse } from "http";

import compression from "compression";
import express, { json } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { logger } from "./utils/logger";

const app = express();

app.use(json());

app.use(helmet({
  contentSecurityPolicy: false
}));
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

export { app };
