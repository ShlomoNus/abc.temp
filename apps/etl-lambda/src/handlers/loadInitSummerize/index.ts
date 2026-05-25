import { GetSummerizeResult } from "./types";

import { esBaseData } from "@/handlers/loadInitialDataToDb/consts";
import { AiService } from "@/services/ai/AiService";

export async function loadInitSummerize(): Promise<GetSummerizeResult> {
  const failed: number[] = [];

  for (const { id, fileUrl, type } of esBaseData) {
    try {
      await AiService.invokeEvent({ id, fileUrl, type });
    }
    catch {
      failed.push(id);
    }
  }

  return {
    lambdaName: AiService.aiLambdaName,
    totalFiles: esBaseData.length,
    queued: esBaseData.length - failed.length,
    failed
  };
}
