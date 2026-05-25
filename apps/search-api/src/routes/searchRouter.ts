import { Router, type Request, type Response } from "express";

import { getSummary } from "@/handlers/getSummary";
import { searchDocuments } from "@/handlers/search";
import { logger } from "@/utils/logger";

const searchRouter = Router();

function getQueryTerm(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
}

searchRouter.get("/search", async(req: Request, res: Response) => {
  const term = getQueryTerm(req.query.term);

  if (!term?.trim()) {
    res.status(400).json({ error: "Query parameter \"term\" is required" });

    return;
  }

  try {
    const result = await searchDocuments(term);

    res.json(result);
  }
  catch(error: unknown) {
    logger.error({ err: error }, "search: failed");
    const message = error instanceof Error ? error.message : "Unknown search error";

    res.status(500).json({ error: message });
  }
});

searchRouter.get("/getSummary", async(_: Request, res: Response) => {
  try {
    const result = await getSummary();

    res.json(result);
  }
  catch(error: unknown) {
    logger.error({ err: error }, "getSummary: failed");
    const message = error instanceof Error ? error.message : "Unknown getSummary error";

    res.status(500).json({ error: message });
  }
});

export { searchRouter };
