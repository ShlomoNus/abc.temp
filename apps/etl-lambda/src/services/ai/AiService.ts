import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { AIAddIncomingFileSummarizyPayload, AIInitSummarizePayload, AiLambdaBasePayload } from "@earthquake-reports/shared";

import { CONFIG } from "@/CONFIG";
import { buildS3ObjectKey } from "@/utils/s3";

export class AiService {
  static readonly aiLambdaName = CONFIG.AI_LAMBDA_NAME;
  private static lambdaClient: LambdaClient | undefined;

  private static getLambdaClient(): LambdaClient {
    if (!this.lambdaClient) {
      this.lambdaClient = new LambdaClient({
        region: CONFIG.AWS_REGION
      });
    }

    return this.lambdaClient;
  }

  private static getFunctionName(): string {
    const functionName = this.aiLambdaName.trim();

    if (!functionName) {
      throw new Error("AI_LAMBDA_NAME is not configured");
    }

    return functionName;
  }

  /** Queue an async Lambda invocation and wait only for the invoke API to accept it. */
  private static async invokeEvent(payload: AiLambdaBasePayload): Promise<void> {
    await this.getLambdaClient().send(
      new InvokeCommand({
        FunctionName: this.getFunctionName(),
        InvocationType: "Event",
        Payload: Buffer.from(JSON.stringify(payload), "utf8")
      })
    );
  }

  static async initSummarize({ id, name, type }: AIInitSummarizePayload): Promise<void> {
    await this.invokeEvent({ id, fileLocation: buildS3ObjectKey({ name, folderPrefix: CONFIG.S3_INIT_LOAD_FOLDER_PREFIX }), type, isShortSummaryRequired: true });
  }

  static async incomingFileSummarize({ id, name, type, isShortSummaryRequired = false }: AIAddIncomingFileSummarizyPayload): Promise<void> {
    await this.invokeEvent({ id, fileLocation: buildS3ObjectKey({ name, folderPrefix: CONFIG.S3_INCOMING_FILES_FOLDER_PREFIX }), type, isShortSummaryRequired });
  }
}
