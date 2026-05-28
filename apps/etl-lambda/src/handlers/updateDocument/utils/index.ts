import type { ArchiveDocument } from "@earthquake-reports/shared";

import type { AddDocumentBodyInput } from "@/handlers/addDocument/schema";

import type { UpdateDocumentResult } from "../types";

export function buildStoredDocument(
  { body, id, ocrResult, createdAt, updatedAt }: {
    body: AddDocumentBodyInput
    id: number
    ocrResult: ArchiveDocument["ocrResult"]
    createdAt: string
    updatedAt: string
  }
): UpdateDocumentResult["document"] {
  return {
    ...body,
    id,
    ocrResult,
    lastModified: body.lastModified,
    createdAt,
    updatedAt
  };
}
