import { bool, cleanEnv, str, num } from "envalid";

import { nodeEnvOption } from "./consts/general";
import { loadLocalEnv } from "./utils/env";
loadLocalEnv();

export const CONFIG = cleanEnv(process.env, {
  LOG_LEVEL: str({ default: "info" }),
  LOG_PRETTY: bool({ default: false }),
  NODE_ENV: str({
    choices: nodeEnvOption
  }),
  PORT: num({ default: 8080 }),
  ES_ENDPOINT: str({ default: "" }),
  ES_INDEX_NAME: str({ default: "earthquake-documents" }),
  ES_API_KEY: str({ default: "" }),
  ES_USERNAME: str({ default: "" }),
  ES_PASSWORD: str({ default: "" }),
  ES_TLS_REJECT_UNAUTHORIZED: bool({ default: true })
});
