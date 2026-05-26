export const swaggerRoutes = {
  "/health": {
    get: {
      summary: "Health check",
      responses: {
        200: {
          description: "Server is running",
          content: {
            "text/plain": {
              schema: {
                type: "string",
                example: "Hello, World!"
              }
            }
          }
        }
      }
    }
  },
  "/search": {
    get: {
      summary: "Search earthquake archive documents",
      description: "Full-text search across configured Elasticsearch fields.",
      parameters: [
        {
          name: "term",
          in: "query",
          required: true,
          description: "Search query string",
          schema: {
            type: "string",
            example: "earthquake"
          }
        }
      ],
      responses: {
        200: {
          description: "Search results",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SearchDocumentsResult"
              }
            }
          }
        },
        400: {
          description: "Missing or empty term query parameter",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Search failed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      }
    }
  },
  "/getSummary": {
    get: {
      summary: "Get summary documents grouped by media type",
      description: "Returns up to six sample documents per media type from the archive index.",
      responses: {
        200: {
          description: "Summary by media type",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GetSummaryResult"
              }
            }
          }
        },
        500: {
          description: "Failed to load summary",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      }
    }
  }
} as const;
