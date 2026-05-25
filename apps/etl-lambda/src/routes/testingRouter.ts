import { Router, type Request, type Response } from "express";
import { serve, setup } from "swagger-ui-express";

import { openApiDocument } from "@/consts/swagger";
import { deleteEsIndex } from "@/handlers/deleteEsIndex";
import {
  getAllDocumentIds,
  getDocumentById
} from "@/handlers/documents";
import { ensureEsDocumentsIndex } from "@/handlers/ensureEsIndex";
import { checkEsHealth } from "@/handlers/esHealth";
import { testingEndpointAccessMiddleware } from "@/middleware/testingEndpointAccess";
import { logger } from "@/utils/logger";

const testingRouter = Router();

testingRouter.use(testingEndpointAccessMiddleware);

testingRouter.get("/openapi.json", (_: Request, res: Response) => {
  res.json(openApiDocument);
});

testingRouter.use("/api-docs", serve, setup(openApiDocument));

testingRouter.get("/documents/ids", async(_: Request, res: Response) => {
  try {
    const ids = await getAllDocumentIds();

    res.json({ ids });
  }
  catch(error: unknown) {
    logger.error({ err: error }, "documents: failed to get document ids");
    const message = error instanceof Error ? error.message : "Unknown documents ids error";

    res.status(500).json({ error: message });
  }
});

testingRouter.get("/documents/:id", async(req: Request, res: Response) => {
  try {
    const documentId = req.params.id;

    if (!documentId || Array.isArray(documentId)) {
      res.status(400).json({ error: "Missing document id" });

      return;
    }

    const document = await getDocumentById(documentId);

    if (!document) {
      res.status(404).json({ error: "Document not found" });

      return;
    }

    res.json({ document });
  }
  catch(error: unknown) {
    logger.error({ err: error }, "documents: failed to get document by id");
    const message = error instanceof Error ? error.message : "Unknown document error";

    res.status(500).json({ error: message });
  }
});

testingRouter.get("/es/health", async(_: Request, res: Response) => {
  try {
    const health = await checkEsHealth();

    res.json({ health });
  }
  catch(error: unknown) {
    logger.error({ err: error }, "esHealth: failed");
    const message = error instanceof Error ? error.message : "Unknown Elasticsearch health error";

    res.status(500).json({ error: message });
  }
});

testingRouter.put("/es/index", async(_: Request, res: Response) => {
  try {
    const ensureResult = await ensureEsDocumentsIndex();

    logger.info({ ensureResult }, "ensureEsIndex: completed");

    res.json({ ensureResult });
  }
  catch(error: unknown) {
    logger.error({ err: error }, "ensureEsIndex: failed");
    const message = error instanceof Error ? error.message : "Unknown ensure index error";

    res.status(500).json({ error: message });
  }
});

testingRouter.delete("/es/index", async(_: Request, res: Response) => {
  try {
    const deleteResult = await deleteEsIndex();

    logger.info({ deleteResult }, "deleteEsIndex: completed");

    res.json({ deleteResult });
  }
  catch(error: unknown) {
    logger.error({ err: error }, "deleteEsIndex: failed");
    const message = error instanceof Error ? error.message : "Unknown delete index error";

    res.status(500).json({ error: message });
  }
});

export { testingRouter };
