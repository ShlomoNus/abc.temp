import {
  type ArchiveDocument,
  type ArchiveDocumentSeed,
  PENDING_OCR_RESULT
} from "@earthquake-reports/shared";
import { estypes } from "@elastic/elasticsearch";

export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  const out: T[][] = [];

  for (let i = 0; i < arr.length; i += chunkSize) {
    out.push(arr.slice(i, i + chunkSize));
  }

  return out;
}

export function buildBulkOperations(
  { indexName, nowIso, chunk }: {
    indexName: string
    nowIso: string
    chunk: ArchiveDocumentSeed[]
  }
): estypes.BulkRequest["operations"] {
  return chunk.flatMap(item => [
    {
      index: {
        _index: indexName,
        _id: String(item.id)
      }
    },
    {
      ...item,
      ocrResult: PENDING_OCR_RESULT,
      lastModified: new Date(nowIso),
      createdAt: nowIso,
      updatedAt: nowIso
    } satisfies ArchiveDocument
  ]);
}
