import { MAX_SEARCH_RESULTS, SEARCH_FIELDS } from "./consts";
import type { SearchDocumentsResult } from "./types";
import { getIndexName, getTotalHits, isDefined, mapSearchHit } from "./utils";

import type { ArchiveDocument } from "@/types/data";
import { esClient } from "@/utils/esClient";

export async function searchDocuments(term: string): Promise<SearchDocumentsResult> {
  const query = term.trim();

  const response = await esClient.search<ArchiveDocument>({
    index: getIndexName(),
    size: MAX_SEARCH_RESULTS,
    track_total_hits: true,
    query: {
      multi_match: {
        query,
        fields: [...SEARCH_FIELDS],
        fuzziness: "AUTO"
      }
    }
  });

  const results = response.hits.hits.map(mapSearchHit).filter(isDefined);

  return {
    results,
    total: getTotalHits(response.hits.total)
  };
}
