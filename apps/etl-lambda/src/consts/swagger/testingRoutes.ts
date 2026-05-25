export const testingSwaggerRoutes = {
  "/testing/documents/ids": {
    get: {
      summary: "Get all Elasticsearch document ids",
      responses: {
        200: {
          description: "Document ids",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ids: {
                    type: "array",
                    items: {
                      type: "string"
                    }
                  }
                },
                required: ["ids"]
              }
            }
          }
        },
        403: {
          description: "Endpoint is blocked outside testing environments",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Failed to fetch document ids",
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
  "/testing/documents/{id}": {
    get: {
      summary: "Get Elasticsearch document by id",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Document",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  document: {
                    $ref: "#/components/schemas/ArchiveDocument"
                  }
                },
                required: ["document"]
              }
            }
          }
        },
        403: {
          description: "Endpoint is blocked outside testing environments",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        404: {
          description: "Document not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Failed to fetch document",
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
  "/testing/es/health": {
    get: {
      summary: "Ping Elasticsearch and check whether ES_INDEX_NAME exists",
      responses: {
        200: {
          description: "Elasticsearch is reachable",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  health: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      indexName: { type: "string" },
                      indexExists: { type: "boolean" }
                    },
                    required: ["ok", "indexName", "indexExists"]
                  }
                },
                required: ["health"]
              }
            }
          }
        },
        403: {
          description: "Endpoint is blocked outside testing environments",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Elasticsearch unreachable or misconfigured",
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
  "/testing/es/index": {
    put: {
      summary: "Create Elasticsearch index with mapping if missing (ES_INDEX_NAME)",
      responses: {
        200: {
          description: "Index ensured (created or already present)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ensureResult: {
                    type: "object",
                    properties: {
                      indexName: { type: "string" },
                      created: { type: "boolean" },
                      message: { type: "string" }
                    },
                    required: ["indexName", "created"]
                  }
                },
                required: ["ensureResult"]
              }
            }
          }
        },
        403: {
          description: "Endpoint is blocked outside testing environments",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Failed to create or verify index",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        }
      }
    },
    delete: {
      summary: "Delete Elasticsearch index (ES_INDEX_NAME)",
      responses: {
        200: {
          description: "Index deleted or already absent",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  deleteResult: {
                    type: "object",
                    properties: {
                      indexName: { type: "string" },
                      deleted: { type: "boolean" },
                      message: { type: "string" }
                    },
                    required: ["indexName", "deleted"]
                  }
                },
                required: ["deleteResult"]
              }
            }
          }
        },
        403: {
          description: "Endpoint is blocked outside testing environments",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              }
            }
          }
        },
        500: {
          description: "Failed to delete index",
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
