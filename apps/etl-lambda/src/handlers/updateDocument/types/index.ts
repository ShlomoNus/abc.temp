import type { ArchiveDocument } from "@earthquake-reports/shared";

export type UpdateDocumentResult = {
  document: ArchiveDocument
};

export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Document not found: ${id}`);
    this.name = "DocumentNotFoundError";
  }
}
