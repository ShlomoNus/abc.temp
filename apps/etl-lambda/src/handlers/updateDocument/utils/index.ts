import type { ArchiveDocument } from "@earthquake-reports/shared";

import type { AddDocumentBodyInput } from "@/handlers/addDocument/schema";

import type { UpdateDocumentResult } from "../types";

export function buildStoredDocument(
  { body, longSummary, id, ocrResult, createdAt, updatedAt }: {
    body: AddDocumentBodyInput
    longSummary: string
    id: number
    ocrResult: ArchiveDocument["ocrResult"]
    createdAt: string
    updatedAt: string
  }
): UpdateDocumentResult["document"] {
  return {
    ...body,
    longSummary,
    id,
    ocrResult,
    lastModified: body.lastModified,
    createdAt,
    updatedAt
  };
}
