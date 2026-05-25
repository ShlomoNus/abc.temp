import { Router, type Request, type Response } from "express";
import { serve, setup } from "swagger-ui-express";

import { openApiDocument } from "@/consts/swagger";
import { testingEndpointAccessMiddleware } from "@/middleware/testingEndpointAccess";

const testingRouter = Router();

testingRouter.use(testingEndpointAccessMiddleware);

testingRouter.get("/health", (_: Request, res: Response) => {
  res.send("Hello, World!");
});

testingRouter.get("/openapi.json", (_: Request, res: Response) => {
  res.json(openApiDocument);
});

testingRouter.use("/api-docs", serve, setup(openApiDocument));

export { testingRouter };
