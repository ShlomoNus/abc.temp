import type { ArchiveDocument } from "@earthquake-reports/shared";
import type { estypes } from "@elastic/elasticsearch";

export type ArchiveDocumentSearchHit = estypes.SearchHit<ArchiveDocument>;
