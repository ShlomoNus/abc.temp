import { Simplify } from "type-fest";

import type { FileMediaType } from "./media";

export type AiLambdaBasePayload = {
  id: number
  fileLocation: string
  type: FileMediaType
  isShortSummaryRequired: boolean
};

export type AIAddIncomingFileSummarizyPayload = Simplify<
  Omit<AiLambdaBasePayload, "fileLocation"> & { name: string }
>;

export type AIInitSummarizePayload = Omit<
  AIAddIncomingFileSummarizyPayload,
  "isShortSummaryRequired"
>;
