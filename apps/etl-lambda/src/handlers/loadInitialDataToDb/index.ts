import { ensureEsDocumentsIndex } from "@/handlers/ensureEsIndex";
import { esClient } from "@/utils/esClient";
import { logger } from "@/utils/logger";

import { BULK_CHUNK_SIZE, esBaseData } from "./consts";
import { LoadInitialDataResult } from "./types";
import { buildBulkOperations, chunkArray } from "./utils";

export async function loadInitialDataToDb(): Promise<LoadInitialDataResult> {
  logger.info({
    totalFiles: esBaseData.length,
    chunkSize: BULK_CHUNK_SIZE
  }, "loadInitialDataToDb: starting");

  logger.info("loadInitialDataToDb: ensuring index exists");
  const { indexName } = await ensureEsDocumentsIndex();

  logger.info({ indexName }, "loadInitialDataToDb: index is ready");

  const nowIso = new Date().toISOString();
  const chunks = chunkArray(esBaseData, BULK_CHUNK_SIZE);
  const errors: string[] = [];
  let indexed = 0;
  let failed = 0;

  for (const [chunkIndex, chunk] of chunks.entries()) {
    const chunkNumber = chunkIndex + 1;
    const operations = buildBulkOperations({ indexName, nowIso, chunk });

    logger.info({
      chunkNumber,
      totalChunks: chunks.length,
      documents: chunk.length
    }, "loadInitialDataToDb: indexing chunk");

    const bulkResponse = await esClient.bulk({
      refresh: "wait_for",
      operations
    });

    let chunkIndexed = 0;
    let chunkFailed = 0;

    for (const item of bulkResponse.items) {
      const indexResult = item.index;

      if (!indexResult) {
        failed += 1;
        chunkFailed += 1;
        logger.error({
          chunkNumber
        }, "loadInitialDataToDb: bulk item missing index result");
        continue;
      }

      if ((indexResult.status ?? 500) >= 300) {
        const errorMessage = [
          `${indexResult._id ?? "unknown"}:`,
          indexResult.error?.type ?? "error",
          indexResult.error?.reason ?? ""
        ].join(" ").trim();

        failed += 1;
        chunkFailed += 1;
        errors.push(errorMessage);
        logger.error({
          chunkNumber,
          documentId: indexResult._id,
          status: indexResult.status,
          error: indexResult.error
        }, "loadInitialDataToDb: failed to index document");
      }
      else {
        indexed += 1;
        chunkIndexed += 1;
      }
    }

    logger.info({
      chunkNumber,
      totalChunks: chunks.length,
      indexed: chunkIndexed,
      failed: chunkFailed
    }, "loadInitialDataToDb: finished indexing chunk");
  }

  logger.info({
    indexName,
    total: esBaseData.length,
    indexed,
    failed
  }, "loadInitialDataToDb: completed");

  return {
    indexName,
    total: esBaseData.length,
    indexed,
    failed,
    errors
  };
}
