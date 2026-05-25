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
  }
} as const;
