import { esClient } from "@/utils/esClient";
import { getEsDocumentsIndexName } from "@/utils/esIndex";

import type { DeleteEsIndexResult } from "./types";

export async function deleteEsIndex(): Promise<DeleteEsIndexResult> {
  const indexName = getEsDocumentsIndexName();

  const existed = await esClient.indices.exists({
    index: indexName
  });

  if (!existed) {
    return {
      indexName,
      deleted: false,
      message: "Index did not exist"
    };
  }

  await esClient.indices.delete({
    index: indexName
  });

  return {
    indexName,
    deleted: true,
    message: "Index deleted"
  };
}
