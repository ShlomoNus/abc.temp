import type { ArchiveDocument } from "@earthquake-reports/shared";
import { PENDING_OCR_RESULT } from "@earthquake-reports/shared";
import { errors } from "@elastic/elasticsearch";

import { AiService } from "@/services/ai/AiService";
import { logger } from "@/utils/logger";

import type { AddDocumentBodyInput } from "../schema";
import type { AddDocumentResult } from "../types";

export function buildStoredDocument(
  { body, id, nowIso }: {
    body: AddDocumentBodyInput
    id: number
    nowIso: string
  }
): AddDocumentResult["document"] {
  return {
    ...body,
    id,
    ocrResult: PENDING_OCR_RESULT,
    lastModified: body.lastModified,
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

export function isDocumentIdConflict(error: unknown): boolean {
  return error instanceof errors.ResponseError && error.meta.statusCode === 409;
}

export async function queueIncomingFileSummarize(document: ArchiveDocument): Promise<void> {
  if (!AiService.aiLambdaName.trim()) {
    logger.warn("addDocument: incomingFileSummarize skipped (AI_LAMBDA_NAME is not configured)");

    return;
  }

  const isShortSummaryRequired = document.summary.trim().length === 0
    && document.longSummary.trim().length === 0;

  await AiService.incomingFileSummarize({
    id: document.id,
    name: document.name,
    type: document.type,
    isShortSummaryRequired
  });
}
