import { esBaseData } from "@/handlers/loadInitialDataToDb/consts";
import { AiService } from "@/services/ai/AiService";

import { GetSummerizeResult } from "./types";

export async function loadInitSummerize(): Promise<GetSummerizeResult> {
  const failed: number[] = [];

  for (const { id, name, type } of esBaseData) {
    try {
      await AiService.initSummarize({ id, name, type });
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
