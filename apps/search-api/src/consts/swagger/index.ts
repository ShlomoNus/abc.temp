import { isTestingEnvironment } from "@/utils/general";

import { swaggerRoutes } from "./routes";
import { testingSwaggerRoutes } from "./testingRoutes";

const shouldAddTestingSwaggerRoutes = isTestingEnvironment();

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Earthquake Reports Search API",
    version: "1.0.0",
    description: "Search and summary endpoints over the earthquake archive Elasticsearch index."
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
      ArchiveDocument: {
        type: "object",
        properties: {
          id: { type: "number" },
          type: {
            type: "string",
            enum: ["docs", "images", "audio", "video"]
          },
          status: {
            type: "string",
            enum: ["init", "deleted", "updated"]
          },
          isPublish: { type: "boolean" },
          fileUrl: { type: "string" },
          name: { type: "string" },
          mediaType: {
            type: "string",
            enum: ["audio", "video", "leaflets", "studies", "guides", "reports", "plans"]
          },
          category: { type: "string" },
          subCategory: { type: "string" },
          language: { type: "string" },
          summary: { type: "string" },
          longSummary: { type: "string" },
          publishDate: { type: "string" },
          size: { type: "string" },
          lastModified: {
            type: "string",
            format: "date-time"
          },
          createdAt: {
            type: "string",
            format: "date-time"
          },
          updatedAt: {
            type: "string",
            format: "date-time"
          }
        }
      },
      SearchDocumentsResult: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ArchiveDocument"
            }
          },
          total: {
            type: "number"
          }
        },
        required: ["results", "total"]
      },
      GetSummaryResult: {
        type: "object",
        properties: {
          summary: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ArchiveDocument"
              }
            },
            description: "Keys are media types (audio, video, leaflets, studies, guides, reports, plans)"
          }
        },
        required: ["summary"]
      },
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
