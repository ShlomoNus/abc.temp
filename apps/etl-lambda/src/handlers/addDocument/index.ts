import { randomInt } from "node:crypto";

import { errors } from "@elastic/elasticsearch";

import { ensureEsDocumentsIndex, getEsDocumentsIndexName } from "@/handlers/ensureEsIndex";
import type { ArchiveDocument } from "@/types/data";
import { esClient } from "@/utils/esClient";

import { addDocumentBodySchema, type AddDocumentBodyInput } from "./schema";

export type AddDocumentResult = {
  document: ArchiveDocument
};

const ID_ATTEMPTS = 40;

function buildStoredDocument(
  { body, id, nowIso }: {
    body: AddDocumentBodyInput
    id: number
    nowIso: string
  }
): AddDocumentResult["document"] {
  return {
    ...body,
    id,
    lastModified: body.lastModified,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

function isDocumentIdConflict(error: unknown): boolean {
  return error instanceof errors.ResponseError && error.meta.statusCode === 409;
}

export async function addDocument(body: unknown): Promise<AddDocumentResult> {
  const parsed = addDocumentBodySchema.safeParse(body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const indexName = getEsDocumentsIndexName();

  await ensureEsDocumentsIndex();

  const nowIso = new Date().toISOString();
  const { lastModified, ...rest } = parsed.data;

  for (let i = 0; i < ID_ATTEMPTS; i++) {
    const id = randomInt(10000, 100000);
    const esBody = {
      ...rest,
      id,
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

      return {
        document: buildStoredDocument({ body: parsed.data, id, nowIso })
      };
    }
    catch(error: unknown) {
      if (isDocumentIdConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Could not allocate a unique 5-digit document id; try again.");
}
