import { CONFIG } from "@/CONFIG";

const { ES_INDEX_NAME } = CONFIG;

export function getIndexName(): string {
  return ES_INDEX_NAME.trim() || "earthquake-documents";
}
