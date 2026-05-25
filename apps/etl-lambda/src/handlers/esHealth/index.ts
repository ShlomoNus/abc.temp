import { getEsDocumentsIndexName } from "@/handlers/ensureEsIndex";
import { esClient } from "@/utils/esClient";

export type EsHealthResult = {
  ok: true
  indexName: string
  indexExists: boolean
};

export async function checkEsHealth(): Promise<EsHealthResult> {
  const indexName = getEsDocumentsIndexName();

  await esClient.ping();

  const indexExists = await esClient.indices.exists({
    index: indexName
  });

  return {
    ok: true,
    indexName,
    indexExists
  };
}
