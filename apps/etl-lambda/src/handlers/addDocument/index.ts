import { PENDING_OCR_RESULT } from "@earthquake-reports/shared";

import { ensureEsDocumentsIndex } from "@/handlers/ensureEsIndex";
import { IdIndexService } from "@/services/idIndex/IdIndexService";
import { esClient } from "@/utils/esClient";
import { getEsDocumentsIndexName } from "@/utils/esIndex";

import { ID_DOCUMENT_CONFLICT_RETRIES } from "./consts";
import { AddDocumentBodyInput, addDocumentBodySchema } from "./schema";
import type { AddDocumentResult } from "./types";
import {
  buildStoredDocument,
  isDocumentIdConflict,
  queueIncomingFileSummarize
} from "./utils";

export async function addDocument(body: AddDocumentBodyInput): Promise<AddDocumentResult> {
  const parsed = addDocumentBodySchema.safeParse(body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const indexName = getEsDocumentsIndexName();

  await ensureEsDocumentsIndex();

  const nowIso = new Date().toISOString();
  const { lastModified, ...rest } = parsed.data;

  for (let i = 0; i < ID_DOCUMENT_CONFLICT_RETRIES; i++) {
    const { id } = await IdIndexService.allocateNextDocumentId();
    const esBody = {
      ...rest,
      longSummary: "",
      id,
      ocrResult: PENDING_OCR_RESULT,
      lastModified: lastModified.toISOString(),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await esClient.index({
        index: indexName,
        id: String(id),
        document: esBody,
        op_type: "create",
        refresh: "wait_for"
      });

      const document = buildStoredDocument({ body: parsed.data, id, nowIso });

      await queueIncomingFileSummarize(document);

      return { document };
    }
    catch(error: unknown) {
      if (isDocumentIdConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not allocate a unique document id; try again.");
}
