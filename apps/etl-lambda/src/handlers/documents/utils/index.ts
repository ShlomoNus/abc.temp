import type { ArchiveDocument } from "@earthquake-reports/shared";

import { CONFIG } from "@/CONFIG";

import type { ArchiveDocumentSearchHit } from "../types";

export function getDocumentsIndexName(): string {
  return CONFIG.ES_INDEX_NAME.trim() || "earthquake-documents";
}

export function mapSearchHit(hit: ArchiveDocumentSearchHit): ArchiveDocument | undefined {
  return hit._source;
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
