import { isTestingEnvironment } from "@/utils/general";

import { swaggerRoutes } from "./routes";
import { testingSwaggerRoutes } from "./testingRoutes";

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
      ArchiveDocument: {
        type: "object",
        properties: {
          id: {
            type: "number"
          },
          name: {
            type: "string"
          },
          fileUrl: {
            type: "string"
          },
          type: {
            type: "string",
            enum: ["docs", "images", "audio", "video"]
          },
          mediaType: {
            type: "string",
            enum: ["audio", "video", "leaflets", "studies", "guides", "reports", "plans"]
          },
          category: {
            type: "string"
          },
          subCategory: {
            type: "string"
          },
          language: {
            type: "string"
          },
          isPublish: {
            type: "boolean"
          },
          status: {
            type: "string"
          },
          summary: {
            type: "string"
          },
          longSummary: {
            type: "string"
          },
          publishDate: {
            type: "string"
          },
          size: {
            type: "string"
          },
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
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string"
          }
        },
        required: ["error"]
      },
      AddDocumentRequest: {
        type: "object",
        description:
          "New document body (same shape as ArchiveDocument without id). type and mediaType are required. Omitted or empty isPublish defaults to false, status to init, lastModified to request time. Server assigns a random 5-digit id.",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["docs", "images", "audio", "video"]
          },
          mediaType: {
            type: "string",
            enum: ["audio", "video", "leaflets", "studies", "guides", "reports", "plans"]
          },
          fileUrl: { type: "string" },
          name: { type: "string" },
          category: { type: "string" },
          subCategory: { type: "string" },
          language: { type: "string" },
          summary: { type: "string" },
          longSummary: { type: "string" },
          publishDate: { type: "string" },
          size: { type: "string" },
          status: {
            type: "string",
            enum: ["init", "deleted", "updated"],
            description: "Defaults to init if omitted or empty"
          },
          isPublish: {
            type: "boolean",
            description: "Defaults to false if omitted or empty"
          },
          lastModified: {
            type: "string",
            format: "date-time",
            description: "ISO-8601; defaults to current time if omitted or empty"
          }
        },
        required: [
          "type",
          "fileUrl",
          "name",
          "mediaType",
          "category",
          "subCategory",
          "language",
          "summary",
          "longSummary",
          "publishDate",
          "size"
        ]
      },
      AddDocumentStored: {
        type: "object",
        description: "Stored document including generated id and timestamps",
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
        },
        required: [
          "id",
          "type",
          "status",
          "isPublish",
          "fileUrl",
          "name",
          "mediaType",
          "category",
          "subCategory",
          "language",
          "summary",
          "longSummary",
          "publishDate",
          "size",
          "lastModified",
          "createdAt",
          "updatedAt"
        ]
      },
      AddDocumentValidationError: {
        type: "object",
        properties: {
          error: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: true
            }
          }
        },
        required: ["error", "issues"]
      }
    }
  }
} as const;
