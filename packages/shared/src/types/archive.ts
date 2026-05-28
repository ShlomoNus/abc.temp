import type { FileMediaType, MediaType } from "./media";
import type { OcrResult } from "./ocr";

export type DocumentStatus = "init" | "deleted" | "updated";

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
  ocrResult: OcrResult
  publishDate: string
  size: string
  lastModified: Date
  createdAt: string
  updatedAt: string
};

/** Catalog seed row (timestamps set when indexing). */
export type ArchiveDocumentSeed = Omit<
  ArchiveDocument,
  "createdAt" | "updatedAt" | "lastModified" | "ocrResult"
>;
