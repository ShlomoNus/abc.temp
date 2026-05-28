import { estypes } from "@elastic/elasticsearch";

/** Singleton document id holding counter state. */
export const ID_INDEX_STATE_DOC_ID = "state";

export const ES_ID_INDEX_MAPPING_BODY: Omit<estypes.IndicesCreateRequest, "index"> = {
  mappings: {
    properties: {
      currentId: { type: "integer" },
      addedIds: { type: "integer" }
    }
  }
} as const;

/** Scripted update retries when concurrent adds bump the counter. */
export const ID_INDEX_ALLOCATE_RETRIES = 5;
