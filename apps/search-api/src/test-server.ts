import { loadLocalEnv } from "./utils/env";

async function main(): Promise<void> {
  loadLocalEnv();

  const [{ app }, { logger }] = await Promise.all([
    import("./server"),
    import("./utils/logger")
  ]);
  const PORT = Number(process.env.PORT) || 3080;

  app.listen(PORT, () => {
    logger.info(`Test server at http://127.0.0.1:${PORT}`);
  });
}

void main().catch(error => {
  console.error("Failed to start test server", error);
  process.exitCode = 1;
});
