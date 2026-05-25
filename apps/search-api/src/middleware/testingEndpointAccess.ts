import { type RequestHandler } from "express";

import { isTestingEnvironment } from "@/utils/general";

const isTestingEndpointEnabled = isTestingEnvironment();

export const testingEndpointAccessMiddleware: RequestHandler = (...[, res, next]) => {
  if (isTestingEndpointEnabled) {
    next();

    return;
  }

  res.status(403).json({
    error: "This endpoint is available only in testing environments"
  });
};
