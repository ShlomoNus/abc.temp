import type { ArchiveDocument, MediaType } from "@/types/data";

export type GetSummaryResult = {
  summary: Record<MediaType, ArchiveDocument[]>
};
