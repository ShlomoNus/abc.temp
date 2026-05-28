import { CONFIG } from "@/CONFIG";

export function getEsDocumentsIndexName(): string {
  return CONFIG.ES_INDEX_NAME.trim() || "earthquake-documents";
}

export function getEsIdIndexName(): string {
  return CONFIG.ES_ID_INDEX_NAME.trim() || "earthquake-id-index";
}
