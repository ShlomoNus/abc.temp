import path from "path";

import { config as loadEnv } from "dotenv";

export function loadLocalEnv(): void {
  const cwd = process.cwd();

  loadEnv({ path: path.resolve(cwd, ".env") });
  loadEnv({
    path: path.resolve(cwd, ".env.secret"),
    override: true
  });
}
