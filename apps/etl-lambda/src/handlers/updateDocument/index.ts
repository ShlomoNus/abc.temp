import type { ArchiveDocument } from "@earthquake-reports/shared";
import { errors } from "@elastic/elasticsearch";

import { addDocumentBodySchema } from "@/handlers/addDocument/schema";
import { esClient } from "@/utils/esClient";
import { getEsDocumentsIndexName } from "@/utils/esIndex";

import { documentIdParamSchema } from "./consts";
import { DocumentNotFoundError, type UpdateDocumentResult } from "./types";
import { buildStoredDocument } from "./utils";

export async function updateDocument(
  idParam: string,
  body: unknown
): Promise<UpdateDocumentResult> {
  const parsedId = documentIdParamSchema.safeParse(idParam);

  if (!parsedId.success) {
    throw parsedId.error;
  }

  const parsedBody = addDocumentBodySchema.safeParse(body);

  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  const indexName = getEsDocumentsIndexName();
  const documentId = parsedId.data;

  let existing: ArchiveDocument;

  try {
    const response = await esClient.get<ArchiveDocument>({
      index: indexName,
      id: documentId
    });

    if (!response._source) {
      throw new DocumentNotFoundError(documentId);
    }

    existing = response._source;
  }
  catch(error: unknown) {
    if (error instanceof DocumentNotFoundError) {
      throw error;
    }

    if (error instanceof errors.ResponseError && error.meta.statusCode === 404) {
      throw new DocumentNotFoundError(documentId);
    }

    throw error;
  }

  const numericId = Number(documentId);
  const nowIso = new Date().toISOString();
  const createdAt = existing.createdAt ?? nowIso;
  const { lastModified, ...rest } = parsedBody.data;
  const esBody = {
    ...rest,
    longSummary: existing.longSummary,
    id: numericId,
    ocrResult: existing.ocrResult,
    lastModified: lastModified.toISOString(),
    createdAt,
    updatedAt: nowIso
  };

  await esClient.index({
    index: indexName,
    id: documentId,
    document: esBody,
    refresh: "wait_for"
  });

  return {
    document: buildStoredDocument({
      body: parsedBody.data,
      longSummary: existing.longSummary,
      id: numericId,
      ocrResult: existing.ocrResult,
      createdAt,
      updatedAt: nowIso
    })
  };
}
