export type OcrStatus = "pending" | "completed" | "failed";

/** Bedrock OCR output for a file; filled by ai-lambda after processing S3 object. */
export type OcrResult = {
  status: OcrStatus
  text: string
  error?: string
};
