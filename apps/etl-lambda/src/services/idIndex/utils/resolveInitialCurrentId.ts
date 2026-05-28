import { errors } from "@elastic/elasticsearch";

import { esClient } from "@/utils/esClient";
import { getEsDocumentsIndexName, getEsIdIndexName } from "@/utils/esIndex";

import { ID_INDEX_STATE_DOC_ID } from "../consts";
import type { IdIndexState } from "../types";

function maxFromAddedIds(addedIds: number[] | undefined): number | undefined {
  if (!addedIds?.length) {
    return undefined;
  }

  return Math.max(...addedIds);
}

async function getMaxDocumentId(): Promise<number> {
  const documentsIndex = getEsDocumentsIndexName();
  const exists = await esClient.indices.exists({
    index: documentsIndex
  });

  if (!exists) {
    return 0;
  }

  const response = await esClient.search({
    index: documentsIndex,
    size: 0,
    aggs: {
      maxId: {
        max: {
          field: "id"
        }
      }
    }
  });

  const maxValue = response.aggregations?.maxId;

  if (!maxValue || !("value" in maxValue) || maxValue.value === null) {
    return 0;
  }

  return maxValue.value;
}

/**
 * Starting counter before the first increment when the id-index state doc is created.
 * Uses max(addedIds) when present; otherwise max document id in the catalog index.
 */
export async function resolveInitialCurrentId(): Promise<number> {
  const idIndexName = getEsIdIndexName();

  try {
    const response = await esClient.get<IdIndexState>({
      index: idIndexName,
      id: ID_INDEX_STATE_DOC_ID
    });

    const state = response._source;

    if (typeof state?.currentId === "number") {
      return state.currentId;
    }

    const fromAddedIds = maxFromAddedIds(state?.addedIds);

    if (fromAddedIds !== undefined) {
      return fromAddedIds;
    }
  }
  catch(error: unknown) {
    if (!(error instanceof errors.ResponseError) || error.meta.statusCode !== 404) {
      throw error;
    }
  }

  return getMaxDocumentId();
}
