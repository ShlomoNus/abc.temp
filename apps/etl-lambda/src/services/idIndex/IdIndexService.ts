import { ensureIndexExists, esClient } from "@/utils/esClient";
import { getEsIdIndexName } from "@/utils/esIndex";

import {
  ES_ID_INDEX_MAPPING_BODY,
  ID_INDEX_ALLOCATE_RETRIES,
  ID_INDEX_STATE_DOC_ID
} from "./consts";
import type {
  AllocateNextDocumentIdResult,
  EnsureIdIndexResult,
  IdIndexState
} from "./types";
import { resolveInitialCurrentId } from "./utils/resolveInitialCurrentId";

const ALLOCATE_NEXT_ID_SCRIPT = `
  if (ctx.op == 'create') {
    ctx._source.currentId = params.initialCurrentId;
    ctx._source.addedIds = new ArrayList();
  }
  int nextId = ctx._source.currentId + 1;
  ctx._source.currentId = nextId;
  ctx._source.addedIds.add(nextId);
`;

export class IdIndexService {
  static async ensureIdIndex(): Promise<EnsureIdIndexResult> {
    const indexName = getEsIdIndexName();
    const { created } = await ensureIndexExists(indexName, ES_ID_INDEX_MAPPING_BODY);

    return {
      indexName,
      created,
      message: created ? "ID index created with mapping" : "ID index already existed"
    };
  }

  static async allocateNextDocumentId(): Promise<AllocateNextDocumentIdResult> {
    await this.ensureIdIndex();

    const indexName = getEsIdIndexName();
    const initialCurrentId = await resolveInitialCurrentId();

    const response = await esClient.update({
      index: indexName,
      id: ID_INDEX_STATE_DOC_ID,
      scripted_upsert: true,
      script: {
        lang: "painless",
        source: ALLOCATE_NEXT_ID_SCRIPT,
        params: {
          initialCurrentId
        }
      },
      upsert: {
        currentId: initialCurrentId,
        addedIds: []
      },
      retry_on_conflict: ID_INDEX_ALLOCATE_RETRIES,
      _source: true,
      refresh: "wait_for"
    });

    const state = response.get?._source as IdIndexState | undefined;

    if (!state?.currentId) {
      throw new Error("Failed to allocate document id from id index");
    }

    return {
      id: state.currentId,
      state
    };
  }
}
