import type { ArchiveDocument } from "@/types/data";

export type SearchDocumentsResult = {
  results: ArchiveDocument[]
  total: number
};
