import { swaggerRoutes } from "./routes";
import { testingSwaggerRoutes } from "./testingRoutes";

import { isTestingEnvironment } from "@/utils/general";

const shouldAddTestingSwaggerRoutes = isTestingEnvironment();

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Service Setup API",
    version: "1.0.0",
    description: "Local API for loading earthquake report data and queueing summarize jobs."
  },
  servers: [
    {
      url: "/",
      description: "Current server"
    }
  ],
  paths: {
    ...swaggerRoutes,
    ...(shouldAddTestingSwaggerRoutes ? testingSwaggerRoutes : {})
  },
  components: {
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string"
          }
        },
        required: ["error"]
      }
    }
  }
} as const;
