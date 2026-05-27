import { Simplify } from "type-fest";

export const PACKAGE_NAME = "@earthquake-reports/shared";

export type FileMediaType = "docs" | "images" | "audio" | "video";

export type DocumentStatus = "init" | "deleted" | "updated";

export type MediaType
  = | "audio"
    | "video"
    | "leaflets"
    | "studies"
    | "guides"
    | "reports"
    | "plans";

export type ArchiveDocument = {
  id: number
  type: FileMediaType
  status: DocumentStatus
  isPublish: boolean
  name: string
  mediaType: MediaType
  category: string
  subCategory: string
  language: string
  summary: string
  longSummary: string
  publishDate: string
  size: string
  lastModified: Date
  createdAt: string
  updatedAt: string
};

/** Catalog seed row (timestamps set when indexing). */
export type ArchiveDocumentSeed = Omit<
  ArchiveDocument,
  "createdAt" | "updatedAt" | "lastModified"
>;

export type AiLambdaBasePayload = {
  id: number
  fileLocation: string
  type: FileMediaType
  isShortSummaryRequired: boolean
};

export type AIAddIncomingFileSummarizyPayload = Simplify<Omit<AiLambdaBasePayload, "fileLocation"> & { name: string }>;

export type AIInitSummarizePayload = Omit<AIAddIncomingFileSummarizyPayload, "isShortSummaryRequired">;