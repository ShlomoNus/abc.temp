import { MEDIA_TYPES } from "./consts";
import type { GetSummaryResult } from "./types";
import { getFirstDocumentsByMediaType } from "./utils";

import type { ArchiveDocument, MediaType } from "@/types/data";

export async function getSummary(): Promise<GetSummaryResult> {
  const entries = await Promise.all(
    MEDIA_TYPES.map(async mediaType => [mediaType, await getFirstDocumentsByMediaType(mediaType)] as const)
  );

  return {
    summary: Object.fromEntries(entries) as Record<MediaType, ArchiveDocument[]>
  };
}
