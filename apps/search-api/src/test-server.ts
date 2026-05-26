import { loadLocalEnv } from "./utils/env";

async function main(): Promise<void> {
  loadLocalEnv();

  const [{ app }, { logger }, { CONFIG }] = await Promise.all([
    import("./app"),
    import("./utils/logger"),
    import("./CONFIG")
  ]);
  const port = CONFIG.PORT;

  app.listen(port, () => {
    const baseUrl = `http://127.0.0.1:${port}`;

    logger.info(`Test server at ${baseUrl}`);
    logger.info(`Swagger UI at ${baseUrl}/testing/api-docs`);
  });
}

void main().catch(error => {
  console.error("Failed to start test server", error);
  process.exitCode = 1;
});
