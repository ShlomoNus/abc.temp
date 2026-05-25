import { loadLocalEnv } from "./utils/env";

async function main(): Promise<void> {
  loadLocalEnv();

  const [{ app }, { logger }] = await Promise.all([
    import("./app"),
    import("./utils/logger")
  ]);
  const PORT = Number(process.env.PORT) || 3080;

  app.listen(PORT, () => {
    const baseUrl = `http://127.0.0.1:${PORT}`;

    logger.info(`Test server at ${baseUrl}`);
    logger.info(`Swagger UI at ${baseUrl}/testing/api-docs`);
  });
}

void main().catch(error => {
  console.error("Failed to start test server", error);
  process.exitCode = 1;
});
