import { estypes } from "@elastic/elasticsearch";

import type { ArchiveDocument } from "@/types/data";

export function mapSearchHit(hit: estypes.SearchHit<ArchiveDocument>): ArchiveDocument | undefined {
  return hit._source;
}
