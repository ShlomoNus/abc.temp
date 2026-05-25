import { errors } from "@elastic/elasticsearch";
import { z } from "zod";

import { addDocumentBodySchema, type AddDocumentBodyInput } from "@/handlers/addDocument/schema";
import { getEsDocumentsIndexName } from "@/handlers/ensureEsIndex";
import type { ArchiveDocument } from "@/types/data";
import { esClient } from "@/utils/esClient";

export type UpdateDocumentResult = {
  document: ArchiveDocument
};

export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Document not found: ${id}`);
    this.name = "DocumentNotFoundError";
  }
}

const documentIdParamSchema = z
  .string()
  .regex(/^\d{5}$/, "Document id must be a 5-digit number");

function buildStoredDocument(
  { body, id, createdAt, updatedAt }: {
    body: AddDocumentBodyInput
    id: number
    createdAt: string
    updatedAt: string
  }
): UpdateDocumentResult["document"] {
  return {
    ...body,
    id,
    lastModified: body.lastModified,
    createdAt,
    updatedAt
  };
}

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
    id: numericId,
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
      id: numericId,
      createdAt,
      updatedAt: nowIso
    })
  };
}
