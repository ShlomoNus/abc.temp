import { bool, cleanEnv, str } from "envalid";

import { nodeEnvOption } from "./consts/general";

export const CONFIG = cleanEnv(process.env, {
  AWS_REGION: str({ default: "il-central-1" }),
  AWS_ACCESS_KEY_ID: str({ default: "" }),
  AWS_SECRET_ACCESS_KEY: str({ default: "" }),
  AWS_SESSION_TOKEN: str({ default: "" }),
  LOG_LEVEL: str({ default: "info" }),
  LOG_PRETTY: bool({ default: false }),
  NODE_ENV: str({
    choices: nodeEnvOption
  }),
  S3_BUCKET_NAME: str({ default: "s3-content-earthquake-dev" }),
  S3_INIT_LOAD_FOLDER_PREFIX: str({ default: "init-load/" }),
  S3_INCOMING_FILES_FOLDER_PREFIX: str({ default: "incoming-files/" }),
  AI_LAMBDA_NAME: str({ default: "" }),
  ES_ENDPOINT: str({ default: "" }),
  ES_INDEX_NAME: str({ default: "earthquake-documents" }),
  ES_API_KEY: str({ default: "" }),
  ES_USERNAME: str({ default: "" }),
  ES_PASSWORD: str({ default: "" }),
  ES_TLS_REJECT_UNAUTHORIZED: bool({ default: true })
});
