import { CONFIG } from "@/CONFIG";

export function getEsDocumentsIndexName(): string {
  return CONFIG.ES_INDEX_NAME.trim() || "earthquake-documents";
}
