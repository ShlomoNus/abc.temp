import type { ArchiveDocument } from "@earthquake-reports/shared";

import { esClient } from "@/utils/esClient";

import { MAX_DOCUMENTS_SIZE } from "./consts";
import { getDocumentsIndexName, isDefined, mapSearchHit } from "./utils";

export async function getAllDocumentIds(): Promise<string[]> {
  const response = await esClient.search<ArchiveDocument>({
    index: getDocumentsIndexName(),
    size: MAX_DOCUMENTS_SIZE,
    _source: false,
    query: {
      match_all: {}
    }
  });

  return response.hits.hits.map(hit => hit._id).filter(isDefined);
}

export async function getDocumentById(id: string): Promise<ArchiveDocument | null> {
  const response = await esClient.search<ArchiveDocument>({
    index: getDocumentsIndexName(),
    size: 1,
    query: {
      ids: {
        values: [id]
      }
    }
  });

  return response.hits.hits[0]?._source ?? null;
}

export async function getAllDocuments(): Promise<ArchiveDocument[]> {
  const response = await esClient.search<ArchiveDocument>({
    index: getDocumentsIndexName(),
    size: MAX_DOCUMENTS_SIZE,
    query: {
      match_all: {}
    }
  });

  return response.hits.hits.map(mapSearchHit).filter(isDefined);
}
