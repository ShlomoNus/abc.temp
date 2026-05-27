import { type IncomingMessage, type ServerResponse } from "http";

import compression from "compression";
import express, { json, type Request, type Response } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { cspByPath } from "./middleware/cspByPath";
import { prodRouter } from "./routes/prodRouter";
import { testingRouter } from "./routes/testingRouter";
import { logger } from "./utils/logger";

const app = express();

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

app.get("/health", (_: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/testing", testingRouter);
app.use(prodRouter);

export { app };
