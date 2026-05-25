import { DOCUMENTS_PER_MEDIA_TYPE } from "../consts";

import { getIndexName } from "./getIndexName";
import { isDefined } from "./isDefined";
import { mapSearchHit } from "./mapSearchHit";

import type { ArchiveDocument, MediaType } from "@/types/data";
import { esClient } from "@/utils/esClient";

export async function getFirstDocumentsByMediaType(mediaType: MediaType): Promise<ArchiveDocument[]> {
  const response = await esClient.search<ArchiveDocument>({
    index: getIndexName(),
    size: DOCUMENTS_PER_MEDIA_TYPE,
    sort: [{ id: { order: "asc" } }],
    query: {
      term: {
        mediaType
      }
    }
  });

  return response.hits.hits.map(mapSearchHit).filter(isDefined);
}
