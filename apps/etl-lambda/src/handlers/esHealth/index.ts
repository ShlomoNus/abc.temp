import { esClient } from "@/utils/esClient";
import { getEsDocumentsIndexName } from "@/utils/esIndex";

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
