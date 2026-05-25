import { pino } from "pino";

import { CONFIG } from "@/CONFIG";

export const logger = pino({
  level: CONFIG.LOG_LEVEL,
  transport: CONFIG.LOG_PRETTY
    ? {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard"
      }
    }
    : undefined
});
