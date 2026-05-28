import { ES_INDEX_MAPPING_BODY } from "@/handlers/loadInitialDataToDb/consts/mapping";
import { ensureIndexExists } from "@/utils/esClient";
import { getEsDocumentsIndexName } from "@/utils/esIndex";

import type { EnsureEsIndexResult } from "./types";

export async function ensureEsDocumentsIndex(): Promise<EnsureEsIndexResult> {
  const indexName = getEsDocumentsIndexName();
  const { created } = await ensureIndexExists(indexName, ES_INDEX_MAPPING_BODY);

  return {
    indexName,
    created,
    message: created ? "Index created with mapping" : "Index already existed"
  };
}
