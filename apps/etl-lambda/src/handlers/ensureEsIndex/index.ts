import { CONFIG } from "@/CONFIG";
import { ES_INDEX_MAPPING_BODY } from "@/handlers/loadInitialDataToDb/consts/mapping";
import { ensureIndexExists } from "@/utils/esClient";

export type EnsureEsIndexResult = {
  indexName: string
  created: boolean
  message?: string
};

export function getEsDocumentsIndexName(): string {
  return CONFIG.ES_INDEX_NAME.trim() || "earthquake-documents";
}

export async function ensureEsDocumentsIndex(): Promise<EnsureEsIndexResult> {
  const indexName = getEsDocumentsIndexName();
  const { created } = await ensureIndexExists(indexName, ES_INDEX_MAPPING_BODY);

  return {
    indexName,
    created,
    message: created ? "Index created with mapping" : "Index already existed"
  };
}
