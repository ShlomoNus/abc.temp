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
  "/getAll": {
    get: {
      summary: "Get all Elasticsearch documents",
      responses: {
        200: {
          description: "Documents",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  documents: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/ArchiveDocument"
                    }
                  }
                },
                required: ["documents"]
              }
            }
          }
        },
        500: {
          description: "Failed to fetch documents",
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
  "/add": {
    post: {
      summary: "Add Elasticsearch document (server-generated 5-digit id)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddDocumentRequest"
            }
          }
        }
      },
      responses: {
        201: {
          description: "Document indexed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  document: {
                    $ref: "#/components/schemas/AddDocumentStored"
                  }
                },
                required: ["document"]
              }
            }
          }
        },
        400: {
          description: "Validation failed (including publish rule: isPublish requires summary or longSummary)",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    $ref: "#/components/schemas/AddDocumentValidationError"
                  },
                  {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                ]
              }
            }
          }
        },
        500: {
          description: "Failed to index document",
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
  "/update/{id}": {
    put: {
      summary: "Update Elasticsearch document by id (id cannot be changed)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            pattern: "^\\d{5}$"
          },
          description: "5-digit document id"
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddDocumentRequest"
            }
          }
        }
      },
      responses: {
        200: {
          description: "Document updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  document: {
                    $ref: "#/components/schemas/AddDocumentStored"
                  }
                },
                required: ["document"]
              }
            }
          }
        },
        400: {
          description: "Invalid id or request body validation failed",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    $ref: "#/components/schemas/AddDocumentValidationError"
                  },
                  {
                    $ref: "#/components/schemas/ErrorResponse"
                  }
                ]
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
          description: "Failed to update document",
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
  "/loadInitInfo": {
    get: {
      summary: "Load initial Elasticsearch data",
      responses: {
        200: {
          description: "Initial data load result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  initResult: {
                    type: "object"
                  }
                },
                required: ["initResult"]
              }
            }
          }
        },
        500: {
          description: "Initial data load failed",
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
  "/loadInitSummerize": {
    get: {
      summary: "Queue initial summarize Lambda jobs",
      responses: {
        200: {
          description: "Summarize queue result",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  summerizeResult: {
                    type: "object",
                    properties: {
                      lambdaName: {
                        type: "string"
                      },
                      totalFiles: {
                        type: "number"
                      },
                      queued: {
                        type: "number"
                      },
                      failed: {
                        type: "array",
                        items: {
                          type: "number"
                        }
                      }
                    },
                    required: ["lambdaName", "totalFiles", "queued", "failed"]
                  }
                },
                required: ["summerizeResult"]
              }
            }
          }
        },
        500: {
          description: "Summarize queueing failed",
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
  "/verifyEsBaseDataS3": {
    get: {
      summary: "Verify esBaseData S3 URLs exist (HeadObject per entry)",
      responses: {
        200: {
          description: "Per-row S3 HeadObject results for esBaseData",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  verifyResult: {
                    type: "object",
                    properties: {
                      total: { type: "number" },
                      found: { type: "number" },
                      missing: { type: "number" },
                      invalidUrl: { type: "number" },
                      error: { type: "number" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "number" },
                            url: { type: "string" },
                            status: {
                              type: "string",
                              enum: ["found", "missing", "invalid_url", "error"]
                            },
                            detail: { type: "string" }
                          },
                          required: ["id", "url", "status"]
                        }
                      }
                    },
                    required: ["total", "found", "missing", "invalidUrl", "error", "items"]
                  }
                },
                required: ["verifyResult"]
              }
            }
          }
        },
        500: {
          description: "S3 verification failed",
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
