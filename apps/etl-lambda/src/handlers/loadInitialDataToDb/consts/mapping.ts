import { estypes } from "@elastic/elasticsearch";

export const ES_INDEX_MAPPING_BODY: Omit<estypes.IndicesCreateRequest, "index"> = {
  mappings: {
    properties: {
      id: { type: "integer" },
      type: { type: "keyword" },
      summary: { type: "text" },
      longSummary: { type: "text" },
      status: { type: "keyword" },
      isPublish: { type: "boolean" },
      publishDate: { type: "keyword" },
      fileUrl: { type: "keyword" },
      name: { type: "keyword" },
      size: { type: "keyword" },
      lastModified: { type: "date" },
      mediaType: { type: "keyword" },
      category: { type: "keyword" },
      subCategory: { type: "keyword" },
      language: { type: "keyword" },
      createdAt: { type: "date" },
      updatedAt: { type: "date" }
    }
  }
} as const;